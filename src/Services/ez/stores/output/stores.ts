import { create } from 'zustand';
import type {
  EZOutputOverviewData,
  EZEmissionsParagraph1Data,
  EZEmissionsParagraph2Data,
  EZEmissionsBarChartData,
  EZEmissionsPieChartsData,
  EZPeopleResponseParagraph1Data,
  EZPeopleResponseParagraph2Data,
  EZPeopleResponseBreakdownChartData,
  EZPeopleResponseTimeImpactChartData,
  EZTripLegRecord,
  EZTripLegsPaginationInfo,
  EZPeopleResponseChartConfig,
  EZTimeImpactChartConfig,
  EZEmissionsBarChartConfig,
  EZVehicleEmissionsChartConfig,
  EZTripLegsTableConfig,
  OutputComponentState,
} from './types';
import {
  DEFAULT_PEOPLE_RESPONSE_CHART_CONFIG,
  DEFAULT_TIME_IMPACT_CHART_CONFIG,
  DEFAULT_EMISSIONS_BAR_CHART_CONFIG,
  DEFAULT_VEHICLE_EMISSIONS_CHART_CONFIG,
  DEFAULT_TRIP_LEGS_TABLE_CONFIG,
} from './defaults';

// === OVERVIEW STORE ===

interface EZOutputOverviewStoreState {
  overviewData: EZOutputOverviewData | null;
  overviewState: OutputComponentState;
  overviewError: string | null;

  setOverviewData: (data: EZOutputOverviewData) => void;
  setOverviewState: (state: OutputComponentState) => void;
  setOverviewError: (error: string | null) => void;
  resetOverviewStore: () => void;
}

export const useEZOutputOverviewStore = create<EZOutputOverviewStoreState>((set) => ({
  overviewData: null,
  overviewState: 'inactive' as OutputComponentState,
  overviewError: null,

  setOverviewData: (overviewData) => set({ overviewData }),
  setOverviewState: (overviewState) => set({ overviewState }),
  setOverviewError: (overviewError) => set({ overviewError }),
  resetOverviewStore: () => set({
    overviewData: null,
    overviewState: 'inactive' as OutputComponentState,
    overviewError: null,
  }),
}));

// === EMISSIONS STORE ===

interface EZOutputEmissionsStoreState {
  emissionsParagraph1Data: EZEmissionsParagraph1Data | null;
  emissionsParagraph2Data: EZEmissionsParagraph2Data | null;
  emissionsBarChartData: EZEmissionsBarChartData | null;
  emissionsPieChartsData: EZEmissionsPieChartsData | null;

  emissionsParagraph1State: OutputComponentState;
  emissionsParagraph2State: OutputComponentState;
  emissionsBarChartState: OutputComponentState;
  emissionsPieChartsState: OutputComponentState;

  emissionsParagraph1Error: string | null;
  emissionsParagraph2Error: string | null;
  emissionsBarChartError: string | null;
  emissionsPieChartsError: string | null;

  setEmissionsParagraph1Data: (data: EZEmissionsParagraph1Data) => void;
  setEmissionsParagraph2Data: (data: EZEmissionsParagraph2Data) => void;
  setEmissionsBarChartData: (data: EZEmissionsBarChartData) => void;
  setEmissionsPieChartsData: (data: EZEmissionsPieChartsData) => void;

  setEmissionsParagraph1State: (state: OutputComponentState) => void;
  setEmissionsParagraph2State: (state: OutputComponentState) => void;
  setEmissionsBarChartState: (state: OutputComponentState) => void;
  setEmissionsPieChartsState: (state: OutputComponentState) => void;

  setEmissionsParagraph1Error: (error: string | null) => void;
  setEmissionsParagraph2Error: (error: string | null) => void;
  setEmissionsBarChartError: (error: string | null) => void;
  setEmissionsPieChartsError: (error: string | null) => void;

  resetEmissionsStore: () => void;
}

export const useEZOutputEmissionsStore = create<EZOutputEmissionsStoreState>((set) => ({
  emissionsParagraph1Data: null,
  emissionsParagraph2Data: null,
  emissionsBarChartData: null,
  emissionsPieChartsData: null,

  emissionsParagraph1State: 'inactive' as OutputComponentState,
  emissionsParagraph2State: 'inactive' as OutputComponentState,
  emissionsBarChartState: 'inactive' as OutputComponentState,
  emissionsPieChartsState: 'inactive' as OutputComponentState,

  emissionsParagraph1Error: null,
  emissionsParagraph2Error: null,
  emissionsBarChartError: null,
  emissionsPieChartsError: null,

  setEmissionsParagraph1Data: (emissionsParagraph1Data) => set({ emissionsParagraph1Data }),
  setEmissionsParagraph2Data: (emissionsParagraph2Data) => set({ emissionsParagraph2Data }),
  setEmissionsBarChartData: (emissionsBarChartData) => set({ emissionsBarChartData }),
  setEmissionsPieChartsData: (emissionsPieChartsData) => set({ emissionsPieChartsData }),

  setEmissionsParagraph1State: (emissionsParagraph1State) => set({ emissionsParagraph1State }),
  setEmissionsParagraph2State: (emissionsParagraph2State) => set({ emissionsParagraph2State }),
  setEmissionsBarChartState: (emissionsBarChartState) => set({ emissionsBarChartState }),
  setEmissionsPieChartsState: (emissionsPieChartsState) => set({ emissionsPieChartsState }),

  setEmissionsParagraph1Error: (emissionsParagraph1Error) => set({ emissionsParagraph1Error }),
  setEmissionsParagraph2Error: (emissionsParagraph2Error) => set({ emissionsParagraph2Error }),
  setEmissionsBarChartError: (emissionsBarChartError) => set({ emissionsBarChartError }),
  setEmissionsPieChartsError: (emissionsPieChartsError) => set({ emissionsPieChartsError }),

  resetEmissionsStore: () => set({
    emissionsParagraph1Data: null,
    emissionsParagraph2Data: null,
    emissionsBarChartData: null,
    emissionsPieChartsData: null,
    emissionsParagraph1State: 'inactive' as OutputComponentState,
    emissionsParagraph2State: 'inactive' as OutputComponentState,
    emissionsBarChartState: 'inactive' as OutputComponentState,
    emissionsPieChartsState: 'inactive' as OutputComponentState,
    emissionsParagraph1Error: null,
    emissionsParagraph2Error: null,
    emissionsBarChartError: null,
    emissionsPieChartsError: null,
  }),
}));

// === PEOPLE RESPONSE STORE ===

interface EZOutputPeopleResponseStoreState {
  peopleResponseParagraph1Data: EZPeopleResponseParagraph1Data | null;
  peopleResponseParagraph2Data: EZPeopleResponseParagraph2Data | null;
  peopleResponseBreakdownChartData: EZPeopleResponseBreakdownChartData | null;
  peopleResponseTimeImpactChartData: EZPeopleResponseTimeImpactChartData | null;

  peopleResponseParagraph1State: OutputComponentState;
  peopleResponseParagraph2State: OutputComponentState;
  peopleResponseBreakdownChartState: OutputComponentState;
  peopleResponseTimeImpactChartState: OutputComponentState;

  peopleResponseParagraph1Error: string | null;
  peopleResponseParagraph2Error: string | null;
  peopleResponseBreakdownChartError: string | null;
  peopleResponseTimeImpactChartError: string | null;

  setPeopleResponseParagraph1Data: (data: EZPeopleResponseParagraph1Data) => void;
  setPeopleResponseParagraph2Data: (data: EZPeopleResponseParagraph2Data) => void;
  setPeopleResponseBreakdownChartData: (data: EZPeopleResponseBreakdownChartData) => void;
  setPeopleResponseTimeImpactChartData: (data: EZPeopleResponseTimeImpactChartData) => void;

  setPeopleResponseParagraph1State: (state: OutputComponentState) => void;
  setPeopleResponseParagraph2State: (state: OutputComponentState) => void;
  setPeopleResponseBreakdownChartState: (state: OutputComponentState) => void;
  setPeopleResponseTimeImpactChartState: (state: OutputComponentState) => void;

  setPeopleResponseParagraph1Error: (error: string | null) => void;
  setPeopleResponseParagraph2Error: (error: string | null) => void;
  setPeopleResponseBreakdownChartError: (error: string | null) => void;
  setPeopleResponseTimeImpactChartError: (error: string | null) => void;

  resetPeopleResponseStore: () => void;
}

export const useEZOutputPeopleResponseStore = create<EZOutputPeopleResponseStoreState>((set) => ({
  peopleResponseParagraph1Data: null,
  peopleResponseParagraph2Data: null,
  peopleResponseBreakdownChartData: null,
  peopleResponseTimeImpactChartData: null,

  peopleResponseParagraph1State: 'inactive' as OutputComponentState,
  peopleResponseParagraph2State: 'inactive' as OutputComponentState,
  peopleResponseBreakdownChartState: 'inactive' as OutputComponentState,
  peopleResponseTimeImpactChartState: 'inactive' as OutputComponentState,

  peopleResponseParagraph1Error: null,
  peopleResponseParagraph2Error: null,
  peopleResponseBreakdownChartError: null,
  peopleResponseTimeImpactChartError: null,

  setPeopleResponseParagraph1Data: (peopleResponseParagraph1Data) => set({ peopleResponseParagraph1Data }),
  setPeopleResponseParagraph2Data: (peopleResponseParagraph2Data) => set({ peopleResponseParagraph2Data }),
  setPeopleResponseBreakdownChartData: (peopleResponseBreakdownChartData) => set({ peopleResponseBreakdownChartData }),
  setPeopleResponseTimeImpactChartData: (peopleResponseTimeImpactChartData) => set({ peopleResponseTimeImpactChartData }),

  setPeopleResponseParagraph1State: (peopleResponseParagraph1State) => set({ peopleResponseParagraph1State }),
  setPeopleResponseParagraph2State: (peopleResponseParagraph2State) => set({ peopleResponseParagraph2State }),
  setPeopleResponseBreakdownChartState: (peopleResponseBreakdownChartState) => set({ peopleResponseBreakdownChartState }),
  setPeopleResponseTimeImpactChartState: (peopleResponseTimeImpactChartState) => set({ peopleResponseTimeImpactChartState }),

  setPeopleResponseParagraph1Error: (peopleResponseParagraph1Error) => set({ peopleResponseParagraph1Error }),
  setPeopleResponseParagraph2Error: (peopleResponseParagraph2Error) => set({ peopleResponseParagraph2Error }),
  setPeopleResponseBreakdownChartError: (peopleResponseBreakdownChartError) => set({ peopleResponseBreakdownChartError }),
  setPeopleResponseTimeImpactChartError: (peopleResponseTimeImpactChartError) => set({ peopleResponseTimeImpactChartError }),

  resetPeopleResponseStore: () => set({
    peopleResponseParagraph1Data: null,
    peopleResponseParagraph2Data: null,
    peopleResponseBreakdownChartData: null,
    peopleResponseTimeImpactChartData: null,
    peopleResponseParagraph1State: 'inactive' as OutputComponentState,
    peopleResponseParagraph2State: 'inactive' as OutputComponentState,
    peopleResponseBreakdownChartState: 'inactive' as OutputComponentState,
    peopleResponseTimeImpactChartState: 'inactive' as OutputComponentState,
    peopleResponseParagraph1Error: null,
    peopleResponseParagraph2Error: null,
    peopleResponseBreakdownChartError: null,
    peopleResponseTimeImpactChartError: null,
  }),
}));

// === TRIP LEGS STORE ===

interface TripLegsFirstPageData {
  records: EZTripLegRecord[];
  totalRecords: number;
  pageSize: number;
}

interface EZOutputTripLegsStoreState {
  tripLegRecords: EZTripLegRecord[];
  tripLegsPagination: EZTripLegsPaginationInfo | null;
  tripLegsTableState: OutputComponentState;
  tripLegsTableError: string | null;

  setTripLegRecords: (records: EZTripLegRecord[]) => void;
  setTripLegsPagination: (pagination: EZTripLegsPaginationInfo) => void;
  setTripLegsTableState: (state: OutputComponentState) => void;
  setTripLegsTableError: (error: string | null) => void;
  setTripLegsFirstPage: (data: TripLegsFirstPageData) => void;
  setTripLegsPage: (page: number, records: EZTripLegRecord[]) => void;

  resetTripLegsStore: () => void;
}

export const useEZOutputTripLegsStore = create<EZOutputTripLegsStoreState>((set) => ({
  tripLegRecords: [],
  tripLegsPagination: null,
  tripLegsTableState: 'inactive' as OutputComponentState,
  tripLegsTableError: null,

  setTripLegRecords: (tripLegRecords) => set({ tripLegRecords }),
  setTripLegsPagination: (tripLegsPagination) => set({ tripLegsPagination }),
  setTripLegsTableState: (tripLegsTableState) => set({ tripLegsTableState }),
  setTripLegsTableError: (tripLegsTableError) => set({ tripLegsTableError }),

  setTripLegsFirstPage: ({ records, totalRecords, pageSize }) => set({
    tripLegRecords: records,
    tripLegsPagination: {
      currentPage: 1,
      pageSize,
      totalRecords,
      totalPages: Math.ceil(totalRecords / pageSize),
    },
    tripLegsTableState: 'success' as OutputComponentState,
  }),

  setTripLegsPage: (page, records) => set((state) => ({
    tripLegRecords: records,
    tripLegsPagination: state.tripLegsPagination
      ? { ...state.tripLegsPagination, currentPage: page }
      : null,
  })),

  resetTripLegsStore: () => set({
    tripLegRecords: [],
    tripLegsPagination: null,
    tripLegsTableState: 'inactive' as OutputComponentState,
    tripLegsTableError: null,
  }),
}));

// === CHART CONFIGURATION STORE ===

interface EZOutputChartConfigStoreState {
  peopleResponseChartConfig: EZPeopleResponseChartConfig;
  timeImpactChartConfig: EZTimeImpactChartConfig;
  emissionsBarChartConfig: EZEmissionsBarChartConfig;
  vehicleEmissionsChartConfig: EZVehicleEmissionsChartConfig;
  tripLegsTableConfig: EZTripLegsTableConfig;
}

export const useEZOutputChartConfigStore = create<EZOutputChartConfigStoreState>(() => ({
  peopleResponseChartConfig: DEFAULT_PEOPLE_RESPONSE_CHART_CONFIG,
  timeImpactChartConfig: DEFAULT_TIME_IMPACT_CHART_CONFIG,
  emissionsBarChartConfig: DEFAULT_EMISSIONS_BAR_CHART_CONFIG,
  vehicleEmissionsChartConfig: DEFAULT_VEHICLE_EMISSIONS_CHART_CONFIG,
  tripLegsTableConfig: DEFAULT_TRIP_LEGS_TABLE_CONFIG,
}));
