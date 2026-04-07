import i18n from '~i18nConfig';
import {
  useEZOutputOverviewStore,
  useEZOutputEmissionsStore,
  useEZOutputPeopleResponseStore,
  useEZOutputTripLegsStore,
} from './stores';
import { useEZOutputMapStore } from './map';

// Sets all incomplete components to error state. Called by universal timeout when simulation times out
export const setIncompleteComponentsToError = (): void => {
  const errorMessage = i18n.t('ez-root:errors.timeout');

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

  if (emissionsStore.emissionsLineChartState !== 'success') {
    emissionsStore.setEmissionsLineChartState('error');
    emissionsStore.setEmissionsLineChartError(errorMessage);
  }

  if (emissionsStore.emissionsStackedBarState !== 'success') {
    emissionsStore.setEmissionsStackedBarState('error');
    emissionsStore.setEmissionsStackedBarError(errorMessage);
  }

  if (emissionsStore.emissionsWarmColdIntensityState !== 'success') {
    emissionsStore.setEmissionsWarmColdIntensityState('error');
    emissionsStore.setEmissionsWarmColdIntensityError(errorMessage);
  }

  // People Response components
  if (peopleStore.peopleResponseParagraphState !== 'success') {
    peopleStore.setPeopleResponseParagraphState('error');
    peopleStore.setPeopleResponseParagraphError(errorMessage);
  }

  if (peopleStore.peopleResponseSankeyState !== 'success') {
    peopleStore.setPeopleResponseSankeyState('error');
    peopleStore.setPeopleResponseSankeyError(errorMessage);
  }

  // Trip Legs
  if (tripLegsStore.tripLegsParagraphState !== 'success') {
    tripLegsStore.setTripLegsParagraphState('error');
    tripLegsStore.setTripLegsParagraphError(errorMessage);
  }

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
