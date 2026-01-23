import { useEZServiceStore, useAPIPayloadStore } from '~store';
import { useEZSessionStore } from '~stores/session';
import type { EZStateType } from '~stores/types';
import { createAPIRequest } from './apiRequestFactory';
import { startSimulationStream } from './sse';
import { getBackendUrl, isBackendConfigured } from './config';
import {
  showProgress,
  showProgressError,
  decodeProgressAlert,
} from '../progress';
import { useProgressStore } from '../progress/store';
import { loadDemoData } from '../output/demo';
import { fetchScenarioMainInput, restoreStoresFromInput } from './fetchScenarioInput';
import { updateScenarioMetadata } from './updateScenarioMetadata';
import { fetchScenarioMetadata } from './fetchScenarioMetadata';

export const startSimulation = async (
  setState: (state: EZStateType) => void,
  onError: (errorMessage: string) => void
): Promise<void> => {
  const isEzBackendAlive = useEZServiceStore.getState().isEzBackendAlive;
  const setSseCleanup = useEZSessionStore.getState().setSseCleanup;

  if (!isEzBackendAlive) {
    const cleanup = runDemoSimulation(setState);
    setSseCleanup(cleanup);
  } else {
    runRealSimulation(setState, onError);
  }
};

const runDemoSimulation = (setState: (state: EZStateType) => void): (() => void) => {
  console.log('[DEMO MODE] Starting demo simulation');

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

  showProgress();

  const timeoutIds: NodeJS.Timeout[] = [];

  demoEvents.forEach(({ event, delay }) => {
    const id = setTimeout(() => {
      decodeProgressAlert(event);
    }, delay);
    timeoutIds.push(id);
  });

  const dataLoadId = setTimeout(() => {
    loadDemoData();
    const transitionId = setTimeout(() => {
      setState('RESULT_VIEW');
    }, 2000);
    timeoutIds.push(transitionId);
  }, 8000);
  timeoutIds.push(dataLoadId);

  return () => {
    timeoutIds.forEach(id => clearTimeout(id));
  };
};

const runRealSimulation = (
  setState: (state: EZStateType) => void,
  onError: (errorMessage: string) => void
): void => {
  const apiPayload = useAPIPayloadStore.getState().payload;
  const scenarioTitle = useEZSessionStore.getState().scenarioTitle;
  const scenarioDescription = useEZSessionStore.getState().scenarioDescription;
  const setRequestId = useEZSessionStore.getState().setRequestId;
  const setSseCleanup = useEZSessionStore.getState().setSseCleanup;

  if (!isBackendConfigured()) {
    showProgressError('Backend URL not configured');
    return;
  }

  const backendUrl = getBackendUrl();

  console.log('[REAL BACKEND] Starting SSE simulation');

  const apiRequest = createAPIRequest(
    apiPayload,
    scenarioTitle,
    scenarioDescription
  );

  showProgress();

  let abortStream: (() => void) | null = null;

  const cleanup = startSimulationStream({
    endpoint: `${backendUrl}/simulate`,
    payload: apiRequest as unknown as Record<string, unknown>,

    onStarted: async (requestId: string) => {
      console.log('[SSE] Simulation started with requestId:', requestId);
      setRequestId(requestId);

      try {
        await updateScenarioMetadata(requestId);
        console.log('[EZ API] Metadata sent successfully');
      } catch (error) {
        console.error('[EZ API] CRITICAL: Failed to send metadata:', error);

        if (abortStream) {
          abortStream();
          setSseCleanup(null);

          const progressStore = useProgressStore.getState();
          progressStore.hide();
          progressStore.reset();

          onError('Failed to send scenario metadata. Please try again.');
        }
        return;
      }
    },

    onComplete: () => {
      console.log('[SSE] Simulation completed successfully');
      setSseCleanup(null);
      setTimeout(() => {
        setState('RESULT_VIEW');
      }, 2000);
    },

    onError: (error) => {
      console.error('[SSE] Simulation error:', error);
      setSseCleanup(null);
      const errorMessage = error.message || 'Simulation failed';

      // Hide and reset progress
      const progressStore = useProgressStore.getState();
      progressStore.hide();
      progressStore.reset();

      onError(errorMessage);
    },
  });

  abortStream = cleanup;
  setSseCleanup(cleanup);
  console.log('[SSE] Stream started, cleanup function stored');
};

export const loadScenario = async (
  requestId: string,
  setState: (state: EZStateType) => void,
  onError: (errorMessage: string) => void
): Promise<void> => {
  const isEzBackendAlive = useEZServiceStore.getState().isEzBackendAlive;
  const setIsNewSimulation = useEZSessionStore.getState().setIsNewSimulation;
  const setSseCleanup = useEZSessionStore.getState().setSseCleanup;

  setIsNewSimulation(false);
  setState('AWAIT_RESULTS');

  if (!isEzBackendAlive) {
    const cleanup = runDemoScenarioLoad(setState);
    setSseCleanup(cleanup);
    return;
  }

  try {
    // Fetch main input (simulation data)
    const mainInput = await fetchScenarioMainInput(requestId);

    // Fetch metadata (UI state)
    const metadata = await fetchScenarioMetadata(requestId);

    // Both succeeded - restore stores from input data
    restoreStoresFromInput(mainInput, metadata);

  } catch (error) {
    // Either main input OR metadata failed - reset all stores
    console.error('[Load Scenario] Failed to load scenario data:', error);

    // CRITICAL: Reset all stores to clean up any partial data
    const { resetAllEZStores } = await import('~stores/reset');
    await resetAllEZStores();

    const errorMessage = error instanceof Error
      ? error.message
      : 'Failed to load scenario data. Both simulation data and metadata are required.';

    onError(errorMessage);
    return; // Stop execution
  }

  runRealScenarioLoad(requestId, setState, onError);
};

const runDemoScenarioLoad = (setState: (state: EZStateType) => void): (() => void) => {
  console.log('[DEMO MODE] Loading demo scenario');

  showProgress();

  const timeoutIds: NodeJS.Timeout[] = [];

  const dataLoadId = setTimeout(() => {
    loadDemoData();
    loadDemoInputData();
  }, 1000);

  timeoutIds.push(dataLoadId);

  return () => {
    timeoutIds.forEach(id => clearTimeout(id));
  };
};

const runRealScenarioLoad = (
  requestId: string,
  setState: (state: EZStateType) => void,
  onError: (errorMessage: string) => void
): void => {
  const setSseCleanup = useEZSessionStore.getState().setSseCleanup;
  const backendUrl = getBackendUrl();

  console.log('[REAL BACKEND] Loading scenario output data:', requestId);

  showProgress();

  const cleanup = startSimulationStream({
    endpoint: `${backendUrl}/scenario/${requestId}`,
    payload: null,
    method: 'GET',

    onStarted: (returnedRequestId: string) => {
      console.log('[SSE] Scenario output stream started:', returnedRequestId);
    },

    onComplete: () => {
      console.log('[SSE] Scenario output stream completed');
      setSseCleanup(null);
      setTimeout(() => {
        setState('RESULT_VIEW');
      }, 500);
    },

    onError: (error) => {
      console.error('[SSE] Scenario load error:', error);
      setSseCleanup(null);
      const errorMessage = error.message || 'Failed to load scenario results';
      onError(errorMessage);
    },
  });

  setSseCleanup(cleanup);
};

const loadDemoInputData = (): void => {
  const sessionStore = useEZSessionStore.getState();

  sessionStore.setScenarioTitle('Demo Scenario');
  sessionStore.setScenarioDescription('This is a demo scenario');
};
