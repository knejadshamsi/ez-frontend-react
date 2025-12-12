import {
  useEZOutputOverviewStore,
  useEZOutputEmissionsStore,
  useEZOutputPeopleResponseStore,
  useEZOutputTripLegsStore,
  useEZOutputMapReadyStore,
} from './stores';
import { useEZOutputMapStore } from './map';

export type * from './types';
export * from './stores';
export * from './map';
export * from './utils';

export const resetAllEZOutputStores = (): void => {
  useEZOutputOverviewStore.getState().resetOverviewStore();
  useEZOutputEmissionsStore.getState().resetEmissionsStore();
  useEZOutputPeopleResponseStore.getState().resetPeopleResponseStore();
  useEZOutputTripLegsStore.getState().resetTripLegsStore();
  useEZOutputMapReadyStore.getState().resetMapReadyStore();
  useEZOutputMapStore.getState().resetMapStore();
};

export const hasOutputData = (): boolean => {
  const overviewData = useEZOutputOverviewStore.getState().overviewData;
  const emissionsParagraph1 = useEZOutputEmissionsStore.getState().emissionsParagraph1Data;
  const peopleResponseParagraph1 = useEZOutputPeopleResponseStore.getState().peopleResponseParagraph1Data;

  return !!(overviewData || emissionsParagraph1 || peopleResponseParagraph1);
};
