import { useEZServiceStore, useAPIPayloadStore, useDrawToolStore } from './index';
import { useEZSessionStore, useEZOutputFiltersStore, useDraftStore } from './session';
import { useDrawingStateStore } from './drawingState';
import { useBatchStore } from './batch';
import { resetAllEZOutputStores } from './output';
import { useProgressStore } from '../progress/store';
import { cancelSimulation } from '../api/cancelSimulation';
import { stopBatchPolling } from '../api/batchPolling';
import { useScenarioPreambleStore, useInputSnapshotStore } from './scenario';

export const resetOutputState = (): void => {
  resetAllEZOutputStores();
  useEZOutputFiltersStore.getState().reset();
  useScenarioPreambleStore.getState().reset();
  useInputSnapshotStore.getState().reset();
  useProgressStore.getState().reset();
};

export const resetAllEZStores = async (): Promise<void> => {
  try {
    const sessionStore = useEZSessionStore.getState();
    if (sessionStore.sseCleanup && sessionStore.requestId) {
      await cancelSimulation(sessionStore.requestId);
    }

    resetAllEZOutputStores();
    useEZOutputFiltersStore.getState().reset();
    useEZSessionStore.getState().reset();
    useProgressStore.getState().reset();
    useAPIPayloadStore.getState().reset();
    useDrawingStateStore.getState().reset();
    useDrawToolStore.getState().reset();
    useScenarioPreambleStore.getState().reset();
    useInputSnapshotStore.getState().reset();
    useDraftStore.getState().reset();
    stopBatchPolling();
    useBatchStore.getState().reset();
    useEZServiceStore.getState().reset();
  } catch (error) {
    console.error('[EZ Reset] Error during reset:', error);
    throw error;
  }
};
