import { useEZServiceStore, useAPIPayloadStore, useDrawToolStore } from './index';
import { useEZSessionStore, useEZOutputFiltersStore } from './session';
import { useDrawingStateStore } from './drawingState';
import { resetAllEZOutputStores } from './output';
import { useProgressStore } from '../progress/store';
import { cancelSimulation } from '../api/cancelSimulation';

export const resetAllEZStores = async (): Promise<void> => {
  try {
    const sessionStore = useEZSessionStore.getState();
    if (sessionStore.sseCleanup && sessionStore.requestId) {
      await cancelSimulation(sessionStore.requestId);
    }

    const progressStore = useProgressStore.getState();
    progressStore.reset();
    progressStore.hide();

    resetAllEZOutputStores();
    useEZOutputFiltersStore.getState().reset();
    useEZSessionStore.getState().reset();
    useAPIPayloadStore.getState().reset();
    useDrawingStateStore.getState().reset();
    useDrawToolStore.getState().reset();
    useEZServiceStore.getState().reset();
  } catch (error) {
    console.error('[EZ Reset] Error during reset:', error);
    throw error;
  }
};
