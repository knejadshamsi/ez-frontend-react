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
import { loadDemoData } from '../output/demo';

export const startSimulation = async (setState: (state: EZStateType) => void): Promise<void> => {
  const isEzBackendAlive = useEZServiceStore.getState().isEzBackendAlive;
  const setSseCleanup = useEZSessionStore.getState().setSseCleanup;

  if (!isEzBackendAlive) {
    const cleanup = runDemoSimulation(setState);
    setSseCleanup(cleanup);
  } else {
    runRealSimulation(setState);
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

const runRealSimulation = (setState: (state: EZStateType) => void): void => {
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

  const cleanup = startSimulationStream({
    endpoint: `${backendUrl}/api/ez/simulate`,
    payload: apiRequest as unknown as Record<string, unknown>,

    onStarted: (requestId: string) => {
      console.log('[SSE] Simulation started with requestId:', requestId);
      setRequestId(requestId);
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
      showProgressError(error.message || 'Simulation failed');
    },
  });

  setSseCleanup(cleanup);
  console.log('[SSE] Stream started, cleanup function stored');
};
