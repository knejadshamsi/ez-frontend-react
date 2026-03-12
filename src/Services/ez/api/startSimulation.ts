import { useEZServiceStore, useAPIPayloadStore } from '~store';
import { useEZSessionStore } from '~stores/session';
import type { EZStateType } from '~stores/types';
import { createAPIRequest } from './apiRequestFactory';
import { startSimulationStream } from './sse';
import type { ValidationError } from './sse';
import { getBackendUrl, isBackendConfigured } from './config';
import { decodeProgressAlert } from '../progress';
import { useProgressStore } from '../progress/store';
import i18n from '~i18nConfig';
import '../progress/locales';
import '../locales';
import { loadDemoData } from '../output/demo';
import { restoreStoresFromInput } from './fetchScenarioInput';
import { useScenarioSnapshotStore, takeInputSnapshot } from '~stores/scenario';
import { useDraftStore } from '~stores/session';
import { deleteDraft } from './draft';
import { fetchScenarioStatus, isTerminalStatus } from './scenarioStatus';
import { resetOutputState } from '~stores/reset';

const t = i18n.t.bind(i18n);
const RESULT_TRANSITION_DELAY_MS = 2000;
const SCENARIO_LOAD_TRANSITION_DELAY_MS = 500;

const TIMEOUT_ERROR_KEYS: Record<string, string> = {
  CONNECTION_TIMEOUT: 'ez-progress:timeout.connection',
  HEARTBEAT_TIMEOUT: 'ez-progress:timeout.heartbeat',
  UNIVERSAL_TIMEOUT: 'ez-progress:timeout.universal',
};

const getErrorMessage = (error: { code?: string; message?: string }): string => {
  if (error.code && TIMEOUT_ERROR_KEYS[error.code]) {
    return t(TIMEOUT_ERROR_KEYS[error.code]);
  }
  return error.message || t('ez-progress:error.fallback');
};

export const startSimulation = async (
  setState: (state: EZStateType) => void,
  onError: (errorMessage: string) => void,
  onValidationError: (errors: ValidationError[]) => void
): Promise<void> => {
  const isEzBackendAlive = useEZServiceStore.getState().isEzBackendAlive;
  const setSseCleanup = useEZSessionStore.getState().setSseCleanup;

  // If starting from a draft, delete it first (absorb errors)
  const draftStore = useDraftStore.getState();
  if (draftStore.draftId) {
    try {
      await deleteDraft(draftStore.draftId);
    } catch {
      // Absorb - simulation requestId is more important
    }
    draftStore.reset();
  }

  if (!isEzBackendAlive) {
    setState('AWAIT_RESULTS');
    const cleanup = runDemoSimulation(setState);
    setSseCleanup(cleanup);
  } else {
    runRealSimulation(setState, onError, onValidationError);
  }
};

const DEMO_QUEUED_DELAY_MS = 1500;

const runDemoSimulation = (setState: (state: EZStateType) => void): (() => void) => {

  const demoEvents = [
    { event: 'preprocessing_population_started', delay: 100 },
    { event: 'preprocessing_population_complete', delay: 600 },
    { event: 'preprocessing_network_started', delay: 700 },
    { event: 'preprocessing_network_complete', delay: 1300 },
    { event: 'preprocessing_transit_started', delay: 1400 },
    { event: 'preprocessing_transit_complete', delay: 2000 },
    { event: 'preprocessing_config_started', delay: 2100 },
    { event: 'preprocessing_config_complete', delay: 2500 },
    { event: 'simulation_base_started', delay: 2700 },
    { event: 'simulation_base_complete', delay: 3800 },
    { event: 'simulation_policy_started', delay: 3900 },
    { event: 'simulation_policy_complete', delay: 5000 },
    { event: 'postprocessing_overview_started', delay: 5200 },
    { event: 'postprocessing_overview_complete', delay: 5700 },
    { event: 'postprocessing_emissions_started', delay: 5800 },
    { event: 'postprocessing_emissions_complete', delay: 6300 },
    { event: 'postprocessing_people_response_started', delay: 6400 },
    { event: 'postprocessing_people_response_complete', delay: 6900 },
    { event: 'postprocessing_trip_legs_started', delay: 7000 },
    { event: 'postprocessing_trip_legs_complete', delay: 7500 },
  ];

  const timeoutIds: NodeJS.Timeout[] = [];

  // Transition from queued to running progress after a brief delay
  const simulationStartId = setTimeout(() => {
    useProgressStore.getState().setStatus('DISPLAY_SIMULATION');
  }, DEMO_QUEUED_DELAY_MS);
  timeoutIds.push(simulationStartId);

  demoEvents.forEach(({ event, delay }) => {
    const id = setTimeout(() => {
      decodeProgressAlert(event);
    }, DEMO_QUEUED_DELAY_MS + delay);
    timeoutIds.push(id);
  });

  const dataLoadId = setTimeout(() => {
    loadDemoData();
    takeInputSnapshot();
    useProgressStore.getState().setStatus('DISPLAY_COMPLETE');
    // Auto-transition to RESULT_VIEW is handled by Progress component
  }, DEMO_QUEUED_DELAY_MS + 8000);
  timeoutIds.push(dataLoadId);

  return () => {
    timeoutIds.forEach(id => clearTimeout(id));
  };
};

const runRealSimulation = (
  setState: (state: EZStateType) => void,
  onError: (errorMessage: string) => void,
  onValidationError: (errors: ValidationError[]) => void
): void => {
  const apiPayload = useAPIPayloadStore.getState().payload;
  const scenarioTitle = useEZSessionStore.getState().scenarioTitle;
  const scenarioDescription = useEZSessionStore.getState().scenarioDescription;
  const setRequestId = useEZSessionStore.getState().setRequestId;
  const setSseCleanup = useEZSessionStore.getState().setSseCleanup;

  if (!isBackendConfigured()) {
    onError(t('ez-progress:error.backendNotConfigured'));
    return;
  }

  const backendUrl = getBackendUrl();

  const apiRequest = createAPIRequest(
    apiPayload,
    scenarioTitle,
    scenarioDescription
  );

  const cleanup = startSimulationStream({
    endpoint: `${backendUrl}/simulate`,
    payload: apiRequest as unknown as Record<string, unknown>,

    onStarted: (requestId: string) => {
      console.log('[EZ API] Request ID:', requestId);
      setRequestId(requestId);
      useProgressStore.getState().reset();
      setState('AWAIT_RESULTS');
    },

    onSimulationStart: () => {
      useProgressStore.getState().setStatus('DISPLAY_SIMULATION');
    },

    onValidationError: (errors) => {
      setSseCleanup(null);
      onValidationError(errors);
    },

    onCancelled: (_reason: string) => {
      setSseCleanup(null);
      resetOutputState();
      setState('PARAMETER_SELECTION');
    },

    onComplete: () => {
      setSseCleanup(null);
      takeInputSnapshot();
      useProgressStore.getState().setStatus('DISPLAY_COMPLETE');
      setTimeout(() => {
        setState('RESULT_VIEW');
      }, RESULT_TRANSITION_DELAY_MS);
    },

    onError: (error) => {
      console.error('[SSE] Simulation error:', error);
      setSseCleanup(null);

      // Only attempt polling recovery for connection-type errors
      const connectionErrors = ['HEARTBEAT_TIMEOUT', 'CONNECTION_TIMEOUT', 'STREAM_ERROR'];
      const currentRequestId = useEZSessionStore.getState().requestId;

      if (currentRequestId && currentRequestId.trim() !== '' && connectionErrors.includes(error.code || '')) {
        startPollingRecovery(currentRequestId, setState, onError);
        return;
      }

      // Application error (error_global, etc.) - show in progress error display
      useProgressStore.getState().setError(getErrorMessage(error));
    },
  });

  setSseCleanup(cleanup);
};

export const loadScenario = async (
  requestId: string,
  setState: (state: EZStateType) => void,
  onError: (errorMessage: string) => void,
  onNonCompleted?: (status: string) => void
): Promise<void> => {
  const isEzBackendAlive = useEZServiceStore.getState().isEzBackendAlive;
  const setIsNewSimulation = useEZSessionStore.getState().setIsNewSimulation;
  const setSseCleanup = useEZSessionStore.getState().setSseCleanup;

  setIsNewSimulation(false);
  useProgressStore.getState().reset();
  setState('AWAIT_RESULTS');

  if (!isEzBackendAlive) {
    const cleanup = runDemoScenarioLoad(setState);
    setSseCleanup(cleanup);
    return;
  }

  runRealScenarioLoad(requestId, setState, onError, onNonCompleted);
};

const runDemoScenarioLoad = (setState: (state: EZStateType) => void): (() => void) => {

  const timeoutIds: NodeJS.Timeout[] = [];

  const dataLoadId = setTimeout(() => {
    loadDemoData();
    loadDemoInputData();
    takeInputSnapshot();
  }, 1000);

  timeoutIds.push(dataLoadId);

  return () => {
    timeoutIds.forEach(id => clearTimeout(id));
  };
};

const runRealScenarioLoad = (
  requestId: string,
  setState: (state: EZStateType) => void,
  onError: (errorMessage: string) => void,
  onNonCompleted?: (status: string) => void
): void => {
  const setSseCleanup = useEZSessionStore.getState().setSseCleanup;
  const backendUrl = getBackendUrl();
  const snapshotStore = useScenarioSnapshotStore.getState;

  let abortStream: (() => void) | null = null;

  const cleanup = startSimulationStream({
    endpoint: `${backendUrl}/scenario/${requestId}`,
    payload: null,
    method: 'GET',

    onScenarioStatus: (status: string) => {
      if (status === 'DELETED') {
        if (abortStream) {
          abortStream();
          setSseCleanup(null);
        }
        if (onNonCompleted) {
          onNonCompleted(status);
        } else {
          onError(t('ez-progress:error.scenarioDeleted'));
        }
      }
    },

    onScenarioSession: () => {
      const status = snapshotStore().status;
      const input = snapshotStore().input;
      const session = snapshotStore().session;

      // Both input and session are mandatory - abort if either is missing
      if (!input || !session) {
        console.error('[SSE] Missing preamble data - input:', !!input, 'session:', !!session);
        if (abortStream) {
          abortStream();
          setSseCleanup(null);
        }
        resetOutputState();
        onError(t('ez-progress:error.title'));
        return;
      }

      if (status === 'COMPLETED') {
        restoreStoresFromInput(input, session);
      } else if (status === 'CANCELLED' || status === 'FAILED') {
        if (abortStream) {
          abortStream();
          setSseCleanup(null);
        }
        if (onNonCompleted) {
          onNonCompleted(status);
        } else {
          onError(status === 'CANCELLED'
            ? t('ez-progress:error.scenarioCancelled')
            : t('ez-progress:error.scenarioFailed'));
        }
      }
    },

    onCancelled: (_reason: string) => {
      setSseCleanup(null);
      resetOutputState();
      setState('PARAMETER_SELECTION');
    },

    onComplete: () => {
      setSseCleanup(null);
      takeInputSnapshot();
      setTimeout(() => {
        setState('RESULT_VIEW');
      }, SCENARIO_LOAD_TRANSITION_DELAY_MS);
    },

    onError: (error) => {
      console.error('[SSE] Scenario load error:', error);
      setSseCleanup(null);

      startPollingRecovery(requestId, setState, onError);
    },
  });

  abortStream = cleanup;
  setSseCleanup(cleanup);
};

const POLL_INTERVAL_MS = 5000;
const MAX_POLL_ATTEMPTS = 24; // 24 x 5s = 2 minutes max

const startPollingRecovery = (
  requestId: string,
  setState: (state: EZStateType) => void,
  onError: (errorMessage: string) => void
): void => {
  const progressStore = useProgressStore.getState();
  progressStore.setStatus('DISPLAY_POLLING_RECOVERY');

  let attempts = 0;

  const poll = async () => {
    attempts++;

    if (attempts > MAX_POLL_ATTEMPTS) {
      console.error('[Polling] Max attempts reached - giving up');
      resetOutputState();
      useEZSessionStore.getState().setRequestId('');
      onError(t('ez-progress:timeout.heartbeat'));
      return;
    }

    try {
      const response = await fetchScenarioStatus(requestId);
      const { status, progress } = response;

      if (isTerminalStatus(status)) {
        if (status === 'COMPLETED') {
          useScenarioSnapshotStore.getState().reset();
          loadScenario(requestId, setState, onError);
        } else {
          resetOutputState();
          useEZSessionStore.getState().setRequestId('');
          onError(t('ez-progress:polling.failed'));
        }
        return;
      }

      // Still running - update progress text and poll again
      useProgressStore.getState().setPollingProgress(progress);
      setTimeout(poll, POLL_INTERVAL_MS);
    } catch (error) {
      console.error('[Polling] Status check failed:', error);
      // Network still down - keep polling (up to max attempts)
      useProgressStore.getState().setPollingProgress(null);
      setTimeout(poll, POLL_INTERVAL_MS);
    }
  };

  setTimeout(poll, POLL_INTERVAL_MS);
};

const loadDemoInputData = (): void => {
  const sessionStore = useEZSessionStore.getState();

  sessionStore.setScenarioTitle(t('ez-root:demoMode.scenarioTitle'));
};
