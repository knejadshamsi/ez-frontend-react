import {
  useEZOutputOverviewStore,
  useEZOutputEmissionsStore,
  useEZOutputPeopleResponseStore,
  useEZOutputTripLegsStore,
} from './stores';
import { useEZOutputMapStore } from './map';

export type * from './types';
export * from './stores';
export * from './map';
export * from './timeout';

export const resetAllEZOutputStores = (): void => {
  useEZOutputOverviewStore.getState().resetOverviewStore();
  useEZOutputEmissionsStore.getState().resetEmissionsStore();
  useEZOutputPeopleResponseStore.getState().resetPeopleResponseStore();
  useEZOutputTripLegsStore.getState().resetTripLegsStore();
  useEZOutputMapStore.getState().resetMapStore();
};

export const getOutputErrorCount = (): number => {
  const states = [
    useEZOutputOverviewStore.getState().overviewState,
    useEZOutputEmissionsStore.getState().emissionsParagraph1State,
    useEZOutputEmissionsStore.getState().emissionsParagraph2State,
    useEZOutputEmissionsStore.getState().emissionsBarChartState,
    useEZOutputEmissionsStore.getState().emissionsLineChartState,
    useEZOutputEmissionsStore.getState().emissionsStackedBarState,
    useEZOutputEmissionsStore.getState().emissionsWarmColdIntensityState,
    useEZOutputPeopleResponseStore.getState().peopleResponseParagraphState,
    useEZOutputPeopleResponseStore.getState().peopleResponseSankeyState,
    useEZOutputTripLegsStore.getState().tripLegsParagraphState,
    useEZOutputTripLegsStore.getState().tripLegsTableState,
    useEZOutputMapStore.getState().emissionsMapState,
    useEZOutputMapStore.getState().peopleResponseMapState,
    useEZOutputMapStore.getState().tripLegsMapState,
  ];
  return states.filter(s => s === 'error' || s === 'error_initial').length;
};

export const hasOutputData = (): boolean => {
  const overviewData = useEZOutputOverviewStore.getState().overviewData;
  const emissionsParagraph1 = useEZOutputEmissionsStore.getState().emissionsParagraph1Data;
  const peopleResponseParagraph = useEZOutputPeopleResponseStore.getState().peopleResponseParagraphData;

  return !!(overviewData || emissionsParagraph1 || peopleResponseParagraph);
};
