import {
  useEZOutputOverviewStore,
  useEZOutputEmissionsStore,
  useEZOutputPeopleResponseStore,
  useEZOutputTripLegsStore,
} from './stores';
import { useEZOutputMapStore } from './map';

// Sets all incomplete components to error state. Called by universal timeout when simulation times out
export const setIncompleteComponentsToError = (): void => {
  const errorMessage = 'Data not received within timeout period';

  const overviewStore = useEZOutputOverviewStore.getState();
  const emissionsStore = useEZOutputEmissionsStore.getState();
  const peopleStore = useEZOutputPeopleResponseStore.getState();
  const tripLegsStore = useEZOutputTripLegsStore.getState();
  const mapStore = useEZOutputMapStore.getState();

  // Overview
  if (overviewStore.overviewState !== 'success') {
    overviewStore.setOverviewState('error');
    overviewStore.setOverviewError(errorMessage);
  }

  // Emissions components
  if (emissionsStore.emissionsParagraph1State !== 'success') {
    emissionsStore.setEmissionsParagraph1State('error');
    emissionsStore.setEmissionsParagraph1Error(errorMessage);
  }

  if (emissionsStore.emissionsParagraph2State !== 'success') {
    emissionsStore.setEmissionsParagraph2State('error');
    emissionsStore.setEmissionsParagraph2Error(errorMessage);
  }

  if (emissionsStore.emissionsBarChartState !== 'success') {
    emissionsStore.setEmissionsBarChartState('error');
    emissionsStore.setEmissionsBarChartError(errorMessage);
  }

  if (emissionsStore.emissionsPieChartsState !== 'success') {
    emissionsStore.setEmissionsPieChartsState('error');
    emissionsStore.setEmissionsPieChartsError(errorMessage);
  }

  // People Response components
  if (peopleStore.peopleResponseParagraph1State !== 'success') {
    peopleStore.setPeopleResponseParagraph1State('error');
    peopleStore.setPeopleResponseParagraph1Error(errorMessage);
  }

  if (peopleStore.peopleResponseParagraph2State !== 'success') {
    peopleStore.setPeopleResponseParagraph2State('error');
    peopleStore.setPeopleResponseParagraph2Error(errorMessage);
  }

  if (peopleStore.peopleResponseBreakdownChartState !== 'success') {
    peopleStore.setPeopleResponseBreakdownChartState('error');
    peopleStore.setPeopleResponseBreakdownChartError(errorMessage);
  }

  if (peopleStore.peopleResponseTimeImpactChartState !== 'success') {
    peopleStore.setPeopleResponseTimeImpactChartState('error');
    peopleStore.setPeopleResponseTimeImpactChartError(errorMessage);
  }

  // Trip Legs
  if (tripLegsStore.tripLegsTableState !== 'success') {
    tripLegsStore.setTripLegsTableState('error');
    tripLegsStore.setTripLegsTableError(errorMessage);
  }

  // Maps
  if (mapStore.emissionsMapState !== 'success') {
    mapStore.setEmissionsMapState('error');
    mapStore.setEmissionsMapError(errorMessage);
  }

  if (mapStore.peopleResponseMapState !== 'success') {
    mapStore.setPeopleResponseMapState('error');
    mapStore.setPeopleResponseMapError(errorMessage);
  }

  if (mapStore.tripLegsMapState !== 'success') {
    mapStore.setTripLegsMapState('error');
    mapStore.setTripLegsMapError(errorMessage);
  }
};
