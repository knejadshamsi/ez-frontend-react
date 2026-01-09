import { useEZServiceStore, useAPIPayloadStore, useDrawToolStore } from './index';
import { useEZSessionStore, useEZOutputFiltersStore } from './session';
import { useDrawingStateStore } from './drawingState';
import { resetAllEZOutputStores } from './output';
import { useProgressStore } from '../progress/store';

export const resetAllEZStores = (): void => {
  try {
    const sessionStore = useEZSessionStore.getState();
    if (sessionStore.sseCleanup) {
      sessionStore.abortSseStream();
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
