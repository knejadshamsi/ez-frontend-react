import { useEZServiceStore, useAPIPayloadStore, useDrawToolStore } from './index';
import { useEZSessionStore, useEZOutputFiltersStore, useDraftStore } from './session';
import { useDrawingStateStore } from './drawingState';
import { resetAllEZOutputStores } from './output';
import { useProgressStore } from '../progress/store';
import { cancelSimulation } from '../api/cancelSimulation';
import { useScenarioSnapshotStore } from './scenario';

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
    useScenarioSnapshotStore.getState().reset();
    useDraftStore.getState().reset();
    useEZServiceStore.getState().reset();
  } catch (error) {
    console.error('[EZ Reset] Error during reset:', error);
    throw error;
  }
};
