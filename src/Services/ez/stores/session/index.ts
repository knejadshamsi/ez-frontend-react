import { useEZSessionStore, useEZOutputFiltersStore } from './stores';

export type * from './types';
export * from './stores';
export * from './defaults';

export const resetAllSessionStores = (): void => {
  useEZSessionStore.getState().reset();
  useEZOutputFiltersStore.getState().reset();
};
