import { useEZServiceStore, useAPIPayloadStore } from '~store';
import { useEZSessionStore } from '~stores/session';
import { useBatchStore } from '~stores/batch';
import type { SessionState } from '~stores/types';
import { createAPIRequest } from './apiRequestFactory';
import { startSimulationStream } from './sse';
import type { ValidationError } from './sse';
import { getBackendUrl, isBackendConfigured } from './config';
import { useProgressStore } from '../progress/store';
import i18n from '~i18nConfig';
import '../progress/locales';
import '../locales';
import { loadDemoData } from '../output/demo';
import { decodeProgressAlert } from '../progress';
import { restoreStoresFromInput } from './fetchScenarioInput';
import { useScenarioPreambleStore, useInputSnapshotStore } from '~stores/scenario';
import { useDraftStore } from '~stores/session';
import { deleteDraft } from './draft';
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
  setState: (state: SessionState) => void,
  onError: (errorMessage: string) => void,
  onValidationError: (errors: ValidationError[]) => void
): Promise<void> => {
  // If starting from a draft, delete it first (absorb errors)
  const draftStore = useDraftStore.getState();
  const wasDraft = draftStore.draftId;
  if (wasDraft) {
    try {
      await deleteDraft(wasDraft);
    } catch {
      // Absorb - simulation requestId is more important
    }
    draftStore.reset();
  }

  const intent = useEZServiceStore.getState().sessionIntent;
  if (intent === 'LOAD_DEMO_SCENARIO') {
    setState('PROCESS_QUEUED');
    const cleanup = runDemoSimulation(setState);
    useEZSessionStore.getState().setSseCleanup(cleanup);
  } else {
    runRealSimulation(setState, onError, onValidationError, wasDraft);
  }
};

const DEMO_QUEUED_DELAY_MS = 1500;
const DEMO_TOTAL_DELAY_MS = 8000;

const runDemoSimulation = (setState: (state: SessionState) => void): (() => void) => {
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

  const simulationStartId = setTimeout(() => {
    setState('PROCESS_RUNNING');
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
    useInputSnapshotStore.getState().save();
    setState('PROCESS_COMPLETE');
    setTimeout(() => {
      setState('VIEW_RESULTS');
    }, RESULT_TRANSITION_DELAY_MS);
  }, DEMO_QUEUED_DELAY_MS + DEMO_TOTAL_DELAY_MS);
  timeoutIds.push(dataLoadId);

  return () => {
    timeoutIds.forEach(id => clearTimeout(id));
  };
};

const runRealSimulation = (
  setState: (state: SessionState) => void,
  onError: (errorMessage: string) => void,
  onValidationError: (errors: ValidationError[]) => void,
  wasDraft?: string | null
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
      const batch = useBatchStore.getState();
      if (batch.isBatchMode) {
        if (wasDraft) {
          batch.removeSimulation(wasDraft);
        }
        batch.removeSimulation('');
        batch.addSimulation(requestId, 'queued');
        batch.setActiveSimId(requestId);
      }
      useProgressStore.getState().reset();
      useEZServiceStore.getState().setIsSseActive(true);
      setState('PROCESS_QUEUED');
    },

    onSimulationStart: () => {
      const batch = useBatchStore.getState();
      if (batch.isBatchMode) {
        const rid = useEZSessionStore.getState().requestId;
        if (rid) batch.updateStatus(rid, 'running');
      }
      setState('PROCESS_RUNNING');
    },

    onValidationError: (errors) => {
      setSseCleanup(null);
      onValidationError(errors);
    },

    onCancelled: (_reason: string) => {
      setSseCleanup(null);
      const batch = useBatchStore.getState();
      if (batch.isBatchMode) {
        const rid = useEZSessionStore.getState().requestId;
        if (rid) batch.updateStatus(rid, 'error', 'Cancelled');
      }
      resetOutputState();
      setState('SELECT_PARAMETERS');
    },

    onComplete: () => {
      setSseCleanup(null);
      useEZServiceStore.getState().setIsSseActive(false);
      useEZServiceStore.getState().setConnectionState('FULL_CONNECT');
      const batch = useBatchStore.getState();
      if (batch.isBatchMode) {
        const rid = useEZSessionStore.getState().requestId;
        if (rid) batch.updateStatus(rid, 'completed');
      }
      useInputSnapshotStore.getState().save();
      setState('PROCESS_COMPLETE');
      setTimeout(() => {
        setState('VIEW_RESULTS');
      }, RESULT_TRANSITION_DELAY_MS);
    },

    onError: (error) => {
      // Ignore SSE death during cancellation - cancel handler owns state transitions
      if (useEZServiceStore.getState().state === 'PROCESS_CANCELLING') return;

      console.error('[SSE] Simulation error:', error);
      setSseCleanup(null);
      useEZServiceStore.getState().setIsSseActive(false);
      const batch = useBatchStore.getState();
      if (batch.isBatchMode) {
        const rid = useEZSessionStore.getState().requestId;
        if (rid) batch.updateStatus(rid, 'error', error.message);
      }

      // Connection-type errors: set HALF_DISCONNECT, let health check polling drive recovery
      const connectionErrors = ['HEARTBEAT_TIMEOUT', 'CONNECTION_TIMEOUT', 'STREAM_ERROR'];
      if (connectionErrors.includes(error.code || '')) {
        useEZServiceStore.getState().setConnectionState('HALF_DISCONNECT');
        setState('PROCESS_CONNECTION_LOST');
        return;
      }

      // Application error (error_global, etc.) - show in progress error display
      useProgressStore.getState().setErrorMessage(getErrorMessage(error));
      setState('PROCESS_ERROR');
    },
  });

  setSseCleanup(cleanup);
};

export const loadScenario = async (
  requestId: string,
  setState: (state: SessionState) => void,
  onError: (errorMessage: string) => void
): Promise<void> => {
  useProgressStore.getState().reset();
  setState('PROCESS_RUNNING');

  const intent = useEZServiceStore.getState().sessionIntent;
  if (intent === 'LOAD_DEMO_SCENARIO') {
    const cleanup = runDemoScenarioLoad(setState);
    useEZSessionStore.getState().setSseCleanup(cleanup);
  } else {
    useEZServiceStore.getState().setIsSseActive(true);
    runRealScenarioLoad(requestId, setState, onError);
  }
};

const runDemoScenarioLoad = (setState: (state: SessionState) => void): (() => void) => {
  const timeoutIds: NodeJS.Timeout[] = [];

  const dataLoadId = setTimeout(() => {
    loadDemoData();
    loadDemoInputData();
    useInputSnapshotStore.getState().save();
    setState('PROCESS_COMPLETE');
    setTimeout(() => {
      setState('VIEW_RESULTS');
    }, SCENARIO_LOAD_TRANSITION_DELAY_MS);
  }, 1000);
  timeoutIds.push(dataLoadId);

  return () => {
    timeoutIds.forEach(id => clearTimeout(id));
  };
};

const loadDemoInputData = (): void => {
  useEZSessionStore.getState().setScenarioTitle(t('ez-root:demoMode.scenarioTitle'));
};

const runRealScenarioLoad = (
  requestId: string,
  setState: (state: SessionState) => void,
  onError: (errorMessage: string) => void
): void => {
  const setSseCleanup = useEZSessionStore.getState().setSseCleanup;
  const backendUrl = getBackendUrl();
  const snapshotStore = useScenarioPreambleStore.getState;

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
        onError(t('ez-progress:error.scenarioDeleted'));
      }
    },

    onScenarioSession: () => {
      const input = snapshotStore().input;
      const session = snapshotStore().session;

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

      restoreStoresFromInput(input, session);
    },

    onCancelled: (_reason: string) => {
      setSseCleanup(null);
      resetOutputState();
      setState('SELECT_PARAMETERS');
    },

    onComplete: () => {
      setSseCleanup(null);
      useEZServiceStore.getState().setIsSseActive(false);
      useEZServiceStore.getState().setConnectionState('FULL_CONNECT');
      useInputSnapshotStore.getState().save();
      if (useBatchStore.getState().isBatchMode) {
        setState('VIEW_RESULTS');
      } else {
        setState('PROCESS_COMPLETE');
        setTimeout(() => {
          setState('VIEW_RESULTS');
        }, SCENARIO_LOAD_TRANSITION_DELAY_MS);
      }
    },

    onError: (error) => {
      // Ignore SSE death during cancellation - cancel handler owns state transitions
      if (useEZServiceStore.getState().state === 'PROCESS_CANCELLING') return;

      console.error('[SSE] Scenario load error:', error);
      setSseCleanup(null);
      useEZServiceStore.getState().setIsSseActive(false);
      useEZServiceStore.getState().setConnectionState('HALF_DISCONNECT');
      setState('PROCESS_CONNECTION_LOST');
    },
  });

  abortStream = cleanup;
  setSseCleanup(cleanup);
};

