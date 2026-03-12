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
  type EZEmissionsLineChartData,
  type EZEmissionsStackedBarData,
  type EZEmissionsWarmColdIntensityData,
  type EZPeopleResponseParagraphData,
  type EZPeopleResponseSankeyData,
  type EZPeopleResponseBarData,
  type EZTripLegsParagraphData,
  type EZTripLegRecord,
} from '~stores/output';

const DEMO_OVERVIEW_DATA: EZOutputOverviewData = {
  personCount: 145000,
  legCount: 387000,
  totalAreaCoverageKm2: 42.5,
  totalNetworkNodes: 8234,
  totalNetworkLinks: 12567,
  totalKmTraveled: 1800000,
  samplePersonCount: 14500,
  sampleLegCount: 38700,
  sampleTotalKmTraveled: 180000,
  samplePercentage: 10,
};

const DEMO_EMISSIONS_PARAGRAPH1_DATA: EZEmissionsParagraph1Data = {
  // Combined
  co2Baseline: 229605395.0, co2Policy: 228297610.0, co2DeltaPercent: -0.57,
  noxBaseline: 2000358.0, noxPolicy: 1995720.0, noxDeltaPercent: -0.23,
  pm25Baseline: 24591.0, pm25Policy: 24559.0, pm25DeltaPercent: -0.13,
  pm10Baseline: 37659.0, pm10Policy: 37610.0, pm10DeltaPercent: -0.13,
  // Private
  privateCo2Baseline: 5125718.0, privateCo2Policy: 3815834.0, privateCo2DeltaPercent: -25.56,
  privateNoxBaseline: 16268.0, privateNoxPolicy: 11609.0, privateNoxDeltaPercent: -28.64,
  privatePm25Baseline: 129.0, privatePm25Policy: 97.0, privatePm25DeltaPercent: -24.8,
  privatePm10Baseline: 199.0, privatePm10Policy: 149.0, privatePm10DeltaPercent: -25.1,
  // Transit
  transitCo2Baseline: 224479677.0, transitCo2Policy: 224481776.0,
  transitNoxBaseline: 1984090.0, transitNoxPolicy: 1984111.0,
  transitPm25Baseline: 24462.0, transitPm25Policy: 24462.0,
  transitPm10Baseline: 37460.0, transitPm10Policy: 37461.0,
};

const DEMO_EMISSIONS_PARAGRAPH2_DATA: EZEmissionsParagraph2Data = {
  pm25PerKm2Baseline: 43.63,
  pm25PerKm2Policy: 43.64,
  zoneAreaKm2: 0.78,
  mixingHeightMeters: 1000.0,
};

const DEMO_EMISSIONS_BAR_CHART_DATA: EZEmissionsBarChartData = {
  ...DEMO_EMISSIONS_PARAGRAPH1_DATA,
};

const DEMO_EMISSIONS_LINE_CHART_DATA: EZEmissionsLineChartData = {
  timeBins: ['0:00-2:30', '2:30-5:00', '5:00-7:30', '7:30-10:00', '10:00-12:30', '12:30-15:00', '15:00-17:30', '17:30-20:00', '20:00-22:30', '22:30-25:00', '25:00-27:30', '27:30-30:00'],
  co2Baseline: [0, 0, 62558.67, 107206.89, 1918.20, 388.34, 62964.96, 87912.94, 472.53, 0, 0, 0],
  co2Policy: [0, 0, 62558.67, 107507.49, 1918.20, 0, 63354.60, 88116.16, 472.53, 0, 0, 0],
  noxBaseline: [0, 0, 536.2, 918.4, 16.4, 3.3, 539.7, 753.1, 4.0, 0, 0, 0],
  noxPolicy: [0, 0, 536.2, 921.0, 16.4, 0, 542.8, 753.7, 4.0, 0, 0, 0],
  pm25Baseline: [0, 0, 6.6, 11.3, 0.2, 0.04, 6.6, 9.3, 0.05, 0, 0, 0],
  pm25Policy: [0, 0, 6.6, 11.3, 0.2, 0, 6.7, 9.3, 0.05, 0, 0, 0],
  pm10Baseline: [0, 0, 9.9, 16.9, 0.3, 0.06, 10.0, 13.9, 0.07, 0, 0, 0],
  pm10Policy: [0, 0, 9.9, 17.0, 0.3, 0, 10.0, 14.0, 0.07, 0, 0, 0],
};

const DEMO_EMISSIONS_STACKED_BAR_DATA: EZEmissionsStackedBarData = {
  baseline: {
    private: {
      co2ByType: { zeroEmission: 896.78, nearZeroEmission: 346.45, lowEmission: 1807.51, midEmission: 821.03, highEmission: 711.71 },
      noxByType: { zeroEmission: 0, nearZeroEmission: 1.2, lowEmission: 3.8, midEmission: 2.1, highEmission: 1.8 },
      pm25ByType: { zeroEmission: 0.02, nearZeroEmission: 0.01, lowEmission: 0.04, midEmission: 0.02, highEmission: 0.01 },
      pm10ByType: { zeroEmission: 0.03, nearZeroEmission: 0.02, lowEmission: 0.06, midEmission: 0.03, highEmission: 0.02 },
    },
    transit: { co2: 318839.04, nox: 2763.27, pm25: 34.01, pm10: 51.01 },
  },
  policy: {
    private: {
      co2ByType: { zeroEmission: 1196.78, nearZeroEmission: 446.45, lowEmission: 1907.51, midEmission: 721.03, highEmission: 611.71 },
      noxByType: { zeroEmission: 0, nearZeroEmission: 1.5, lowEmission: 4.0, midEmission: 1.8, highEmission: 1.5 },
      pm25ByType: { zeroEmission: 0.03, nearZeroEmission: 0.02, lowEmission: 0.04, midEmission: 0.01, highEmission: 0.01 },
      pm10ByType: { zeroEmission: 0.04, nearZeroEmission: 0.02, lowEmission: 0.06, midEmission: 0.02, highEmission: 0.02 },
    },
    transit: { co2: 319044.16, nox: 2764.15, pm25: 34.01, pm10: 51.02 },
  },
};

const DEMO_EMISSIONS_WARM_COLD_DATA: EZEmissionsWarmColdIntensityData = {
  warmCold: {
    warmBaseline: 325577.92,
    coldBaseline: 702.27,
    warmPolicy: 325975.03,
    coldPolicy: 811.33,
  },
  intensity: {
    co2Baseline: 4583.49,
    co2Policy: 5088.61,
    distanceBaseline: 32246.0,
    distancePolicy: 32621.0,
    co2PerMeterBaseline: 0.142,
    co2PerMeterPolicy: 0.156,
  },
};

const DEMO_PEOPLE_RESPONSE_PARAGRAPH_DATA: EZPeopleResponseParagraphData = {
  totalTrips: 18,
  affectedTrips: 2,
  affectedAgents: 1,
  modeShiftCount: 2,
  modeShiftPct: 11.11,
  reroutedCount: 0,
  reroutedPct: 0.0,
  paidPenaltyCount: 0,
  paidPenaltyPct: 0.0,
  cancelledCount: 0,
  cancelledPct: 0.0,
  noChangeCount: 16,
  noChangePct: 88.89,
  dominantResponse: 'modeShift',
  penaltyCharges: [{ zoneName: 'Zone A', rate: 5.0 }],
};

const DEMO_PEOPLE_RESPONSE_SANKEY_DATA: EZPeopleResponseSankeyData = {
  nodes: ['car', 'bus', 'subway', 'walk', 'bike'],
  flows: [
    { from: 'walk', to: 'car', count: 2 },
    { from: 'bike', to: 'bike', count: 4 },
    { from: 'car', to: 'car', count: 12 },
  ],
};

const DEMO_PEOPLE_RESPONSE_BAR_DATA: EZPeopleResponseBarData = {
  modes: ['car', 'bus', 'subway', 'walk', 'bike'],
  baseline: [66.67, 0.0, 0.0, 11.11, 22.22],
  policy: [77.78, 0.0, 0.0, 0.0, 22.22],
};

const DEMO_TRIP_PERFORMANCE_PARAGRAPH_DATA: EZTripLegsParagraphData = {
  totalTrips: 18,
  changedTrips: 2,
  unchangedTrips: 16,
  cancelledTrips: 0,
  newTrips: 0,
  modeShiftTrips: 2,
  netCo2DeltaGrams: 377.38,
  netTimeDeltaMinutes: -80.20,
  avgCo2DeltaGrams: 188.69,
  avgTimeDeltaMinutes: -40.10,
  improvedCo2Count: 0,
  worsenedCo2Count: 1,
  improvedTimeCount: 2,
  worsenedTimeCount: 0,
  winWinCount: 0,
  loseLoseCount: 0,
  envWinPersonalCostCount: 0,
  personalWinEnvCostCount: 1,
  dominantOutcome: 'personalWinEnvCost',
};

const DEMO_TRIP_LEGS_PAGE_SIZE = 10;

const DEMO_TRIP_LEG_FIRST_PAGE: EZTripLegRecord[] = [
  { legId: 'leg_00001', personId: 'P1042', originActivity: 'A_Home_1042', destinationActivity: 'A_Work_1042', co2DeltaGrams: -245, timeDeltaMinutes: 8, impact: 'Car -> Bus' },
  { legId: 'leg_00002', personId: 'P2387', originActivity: 'A_Home_2387', destinationActivity: 'A_Shop_2387', co2DeltaGrams: -180, timeDeltaMinutes: 5, impact: 'Car -> Walking' },
  { legId: 'leg_00003', personId: 'P5621', originActivity: 'A_Work_5621', destinationActivity: 'A_Home_5621', co2DeltaGrams: -320, timeDeltaMinutes: 12, impact: 'Car -> Subway' },
  { legId: 'leg_00004', personId: 'P8934', originActivity: 'A_Home_8934', destinationActivity: 'A_Leisure_8934', co2DeltaGrams: 0, timeDeltaMinutes: 0, impact: 'Paid Penalty' },
  { legId: 'leg_00005', personId: 'P3456', originActivity: 'A_Work_3456', destinationActivity: 'A_Shop_3456', co2DeltaGrams: -95, timeDeltaMinutes: -3, impact: 'Rerouted' },
  { legId: 'leg_00006', personId: 'P7823', originActivity: 'A_Home_7823', destinationActivity: 'A_Work_7823', co2DeltaGrams: -410, timeDeltaMinutes: 15, impact: 'Car -> Biking' },
  { legId: 'leg_00007', personId: 'P4521', originActivity: 'A_Shop_4521', destinationActivity: 'A_Home_4521', co2DeltaGrams: -210, timeDeltaMinutes: 7, impact: 'Car -> Bus' },
  { legId: 'leg_00008', personId: 'P9087', originActivity: 'A_Home_9087', destinationActivity: 'A_Work_9087', co2DeltaGrams: 0, timeDeltaMinutes: 2, impact: 'Paid Penalty' },
  { legId: 'leg_00009', personId: 'P1234', originActivity: 'A_Work_1234', destinationActivity: 'A_Leisure_1234', co2DeltaGrams: -150, timeDeltaMinutes: -5, impact: 'Rerouted' },
  { legId: 'leg_00010', personId: 'P6789', originActivity: 'A_Home_6789', destinationActivity: 'A_Work_6789', co2DeltaGrams: -280, timeDeltaMinutes: 10, impact: 'Car -> Subway' },
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
  useEZOutputEmissionsStore.getState().setEmissionsLineChartData(DEMO_EMISSIONS_LINE_CHART_DATA);
  useEZOutputEmissionsStore.getState().setEmissionsLineChartState('success');
  useEZOutputEmissionsStore.getState().setEmissionsStackedBarData(DEMO_EMISSIONS_STACKED_BAR_DATA);
  useEZOutputEmissionsStore.getState().setEmissionsStackedBarState('success');
  useEZOutputEmissionsStore.getState().setEmissionsWarmColdIntensityData(DEMO_EMISSIONS_WARM_COLD_DATA);
  useEZOutputEmissionsStore.getState().setEmissionsWarmColdIntensityState('success');

  useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraphData(DEMO_PEOPLE_RESPONSE_PARAGRAPH_DATA);
  useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraphState('success');
  useEZOutputPeopleResponseStore.getState().setPeopleResponseSankeyData(DEMO_PEOPLE_RESPONSE_SANKEY_DATA);
  useEZOutputPeopleResponseStore.getState().setPeopleResponseSankeyState('success');
  useEZOutputPeopleResponseStore.getState().setPeopleResponseBarData(DEMO_PEOPLE_RESPONSE_BAR_DATA);
  useEZOutputPeopleResponseStore.getState().setPeopleResponseBarState('success');

  useEZOutputTripLegsStore.getState().setTripLegsParagraphData(DEMO_TRIP_PERFORMANCE_PARAGRAPH_DATA);
  useEZOutputTripLegsStore.getState().setTripLegsParagraphState('success');

  useEZOutputTripLegsStore.getState().setTripLegsFirstPage({
    records: DEMO_TRIP_LEG_FIRST_PAGE,
    totalRecords: DEMO_TRIP_LEG_FIRST_PAGE.length,
    totalAllRecords: 18,
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
