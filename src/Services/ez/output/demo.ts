import { useEffect } from 'react';
import { useEZServiceStore } from '~store';
import {
  useEZOutputOverviewStore,
  useEZOutputEmissionsStore,
  useEZOutputPeopleResponseStore,
  useEZOutputTripLegsStore,
  useEZOutputMapStore,
  type EZOutputOverviewData,
  type EZEmissionsParagraph1Data,
  type EZEmissionsParagraph2Data,
  type EZEmissionsBarChartData,
  type EZEmissionsPieChartsData,
  type EZPeopleResponseParagraph1Data,
  type EZPeopleResponseParagraph2Data,
  type EZPeopleResponseBreakdownChartData,
  type EZPeopleResponseTimeImpactChartData,
  type EZTripLegRecord,
} from '~stores/output';

const DEMO_OVERVIEW_DATA: EZOutputOverviewData = {
  totalPersonCount: 145000,
  totalLegCount: 387000,
  totalAreaCoverageKm2: 42.5,
  totalNetworkNodes: 8234,
  totalNetworkLinks: 12567,
  totalKilometersTraveled: 1800000,
};

const DEMO_EMISSIONS_PARAGRAPH1_DATA: EZEmissionsParagraph1Data = {
  co2Baseline: 41.5,
  co2PostPolicy: 31.8,
  pm25Baseline: 0.034,
  pm25PostPolicy: 0.027,
  noxBaseline: 0.182,
  noxPostPolicy: 0.149,
  pm10Baseline: 0.048,
  pm10PostPolicy: 0.038,
  modeShiftPercentage: 21,
};

const DEMO_EMISSIONS_PARAGRAPH2_DATA: EZEmissionsParagraph2Data = {
  pm25PostPolicy: 0.027,
  zeroEmissionShareBaseline: 5.2,
  zeroEmissionSharePostPolicy: 8.5,
  nearZeroEmissionShareBaseline: 12.1,
  nearZeroEmissionSharePostPolicy: 15.3,
  lowEmissionShareBaseline: 28.4,
  lowEmissionSharePostPolicy: 30.7,
  midEmissionShareBaseline: 32.9,
  midEmissionSharePostPolicy: 28.1,
  highEmissionShareBaseline: 21.4,
  highEmissionSharePostPolicy: 17.4,
};

const DEMO_EMISSIONS_BAR_CHART_DATA: EZEmissionsBarChartData = {
  baselineEmissions: [41.5, 0.182, 0.034, 0.048],
  postPolicyEmissions: [31.8, 0.149, 0.027, 0.038],
};

const DEMO_EMISSIONS_PIE_CHARTS_DATA: EZEmissionsPieChartsData = {
  vehicleShareBaseline: [5.2, 12.1, 28.4, 32.9, 21.4],
  vehicleSharePostPolicy: [8.5, 15.3, 30.7, 28.1, 17.4],
};

const DEMO_PEOPLE_RESPONSE_PARAGRAPH1_DATA: EZPeopleResponseParagraph1Data = {
  paidPenaltyPercentage: 47,
  reroutedPercentage: 28,
  switchedToBusPercentage: 8,
  switchedToSubwayPercentage: 7,
  switchedToWalkingPercentage: 4,
  switchedToBikingPercentage: 2,
  switchedToCarPercentage: 3,
  cancelledTripPercentage: 1,
  penaltyCharges: [{ zoneName: 'Zone A', rate: 10 }],
  totalAffectedTrips: 72000,
};

const DEMO_PEOPLE_RESPONSE_PARAGRAPH2_DATA: EZPeopleResponseParagraph2Data = {
  averageTimePaidPenalty: 1,
  averageTimeRerouted: -2,
  averageTimeSwitchedToBus: 8,
  averageTimeSwitchedToSubway: 12,
  averageTimeSwitchedToWalking: 5,
  averageTimeSwitchedToBiking: 15,
  averageTimeSwitchedToCar: 3,
};

const DEMO_PEOPLE_RESPONSE_BREAKDOWN_DATA: EZPeopleResponseBreakdownChartData = {
  responsePercentages: [47, 28, 8, 7, 4, 2, 3, 1],
};

const DEMO_PEOPLE_RESPONSE_TIME_IMPACT_DATA: EZPeopleResponseTimeImpactChartData = {
  averageTimeDeltas: [1, -2, 8, 12, 5, 15, 3],
};

const DEMO_TRIP_LEGS_PAGE_SIZE = 10;

const DEMO_TRIP_LEG_FIRST_PAGE: EZTripLegRecord[] = [
  { legId: 'leg_00001', personId: 'P1042', originActivityType: 'A_Home_1042', destinationActivityType: 'A_Work_1042', co2DeltaGrams: -245, timeDeltaMinutes: 8, impact: 'Car → Bus' },
  { legId: 'leg_00002', personId: 'P2387', originActivityType: 'A_Home_2387', destinationActivityType: 'A_Shop_2387', co2DeltaGrams: -180, timeDeltaMinutes: 5, impact: 'Car → Walking' },
  { legId: 'leg_00003', personId: 'P5621', originActivityType: 'A_Work_5621', destinationActivityType: 'A_Home_5621', co2DeltaGrams: -320, timeDeltaMinutes: 12, impact: 'Car → Subway' },
  { legId: 'leg_00004', personId: 'P8934', originActivityType: 'A_Home_8934', destinationActivityType: 'A_Leisure_8934', co2DeltaGrams: 0, timeDeltaMinutes: 0, impact: 'Paid Penalty' },
  { legId: 'leg_00005', personId: 'P3456', originActivityType: 'A_Work_3456', destinationActivityType: 'A_Shop_3456', co2DeltaGrams: -95, timeDeltaMinutes: -3, impact: 'Rerouted' },
  { legId: 'leg_00006', personId: 'P7823', originActivityType: 'A_Home_7823', destinationActivityType: 'A_Work_7823', co2DeltaGrams: -410, timeDeltaMinutes: 15, impact: 'Car → Biking' },
  { legId: 'leg_00007', personId: 'P4521', originActivityType: 'A_Shop_4521', destinationActivityType: 'A_Home_4521', co2DeltaGrams: -210, timeDeltaMinutes: 7, impact: 'Car → Bus' },
  { legId: 'leg_00008', personId: 'P9087', originActivityType: 'A_Home_9087', destinationActivityType: 'A_Work_9087', co2DeltaGrams: 0, timeDeltaMinutes: 2, impact: 'Paid Penalty' },
  { legId: 'leg_00009', personId: 'P1234', originActivityType: 'A_Work_1234', destinationActivityType: 'A_Leisure_1234', co2DeltaGrams: -150, timeDeltaMinutes: -5, impact: 'Rerouted' },
  { legId: 'leg_00010', personId: 'P6789', originActivityType: 'A_Home_6789', destinationActivityType: 'A_Work_6789', co2DeltaGrams: -280, timeDeltaMinutes: 10, impact: 'Car → Subway' },
];

// Populates all output stores with demo data (called when backend is unavailable)
export const loadDemoData = (): void => {
  useEZOutputOverviewStore.getState().setOverviewData(DEMO_OVERVIEW_DATA);
  useEZOutputOverviewStore.getState().setOverviewState('success');

  useEZOutputEmissionsStore.getState().setEmissionsParagraph1Data(DEMO_EMISSIONS_PARAGRAPH1_DATA);
  useEZOutputEmissionsStore.getState().setEmissionsParagraph1State('success');
  useEZOutputEmissionsStore.getState().setEmissionsParagraph2Data(DEMO_EMISSIONS_PARAGRAPH2_DATA);
  useEZOutputEmissionsStore.getState().setEmissionsParagraph2State('success');
  useEZOutputEmissionsStore.getState().setEmissionsBarChartData(DEMO_EMISSIONS_BAR_CHART_DATA);
  useEZOutputEmissionsStore.getState().setEmissionsBarChartState('success');
  useEZOutputEmissionsStore.getState().setEmissionsPieChartsData(DEMO_EMISSIONS_PIE_CHARTS_DATA);
  useEZOutputEmissionsStore.getState().setEmissionsPieChartsState('success');

  useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraph1Data(DEMO_PEOPLE_RESPONSE_PARAGRAPH1_DATA);
  useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraph1State('success');
  useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraph2Data(DEMO_PEOPLE_RESPONSE_PARAGRAPH2_DATA);
  useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraph2State('success');
  useEZOutputPeopleResponseStore.getState().setPeopleResponseBreakdownChartData(DEMO_PEOPLE_RESPONSE_BREAKDOWN_DATA);
  useEZOutputPeopleResponseStore.getState().setPeopleResponseBreakdownChartState('success');
  useEZOutputPeopleResponseStore.getState().setPeopleResponseTimeImpactChartData(DEMO_PEOPLE_RESPONSE_TIME_IMPACT_DATA);
  useEZOutputPeopleResponseStore.getState().setPeopleResponseTimeImpactChartState('success');

  useEZOutputTripLegsStore.getState().setTripLegsFirstPage({
    records: DEMO_TRIP_LEG_FIRST_PAGE,
    totalRecords: DEMO_TRIP_LEG_FIRST_PAGE.length,
    pageSize: DEMO_TRIP_LEGS_PAGE_SIZE,
  });

  useEZOutputMapStore.getState().setEmissionsMapState('success_initial');
  useEZOutputMapStore.getState().setPeopleResponseMapState('success_initial');
  useEZOutputMapStore.getState().setTripLegsMapState('success_initial');
};

// Watches backend status and loads demo data when backend is unavailable
export const useDemoDataLoader = () => {
  const isEzBackendAlive = useEZServiceStore((state) => state.isEzBackendAlive);

  useEffect(() => {
    if (isEzBackendAlive) return;
    loadDemoData();
  }, [isEzBackendAlive]);
};
