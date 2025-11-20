import {
  useEZOutputOverviewStore,
  useEZOutputEmissionsStore,
  useEZOutputPeopleResponseStore,
  useEZOutputTripLegsStore,
  useEZOutputMapReadyStore,
} from './stores';
import { useEZOutputMapStore } from '../outputMap';

export type * from './types';
export * from './stores';

/* Reset all output stores to initial state */
export const resetAllEZOutputStores = (): void => {
  useEZOutputOverviewStore.getState().resetOverviewStore();
  useEZOutputEmissionsStore.getState().resetEmissionsStore();
  useEZOutputPeopleResponseStore.getState().resetPeopleResponseStore();
  useEZOutputTripLegsStore.getState().resetTripLegsStore();
  useEZOutputMapReadyStore.getState().resetMapReadyStore();
  useEZOutputMapStore.getState().resetMapStore();
};
