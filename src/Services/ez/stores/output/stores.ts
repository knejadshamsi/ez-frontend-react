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
  setOverviewData: (data: EZOutputOverviewData) => void;
  resetOverviewStore: () => void;
}

export const useEZOutputOverviewStore = create<EZOutputOverviewStoreState>((set) => ({
  overviewData: null,
  setOverviewData: (overviewData) => set({ overviewData }),
  resetOverviewStore: () => set({ overviewData: null }),
}));

// === EMISSIONS STORE ===

interface EZOutputEmissionsStoreState {
  emissionsParagraph1Data: EZEmissionsParagraph1Data | null;
  emissionsParagraph2Data: EZEmissionsParagraph2Data | null;
  emissionsBarChartData: EZEmissionsBarChartData | null;
  emissionsPieChartsData: EZEmissionsPieChartsData | null;

  setEmissionsParagraph1Data: (data: EZEmissionsParagraph1Data) => void;
  setEmissionsParagraph2Data: (data: EZEmissionsParagraph2Data) => void;
  setEmissionsBarChartData: (data: EZEmissionsBarChartData) => void;
  setEmissionsPieChartsData: (data: EZEmissionsPieChartsData) => void;

  resetEmissionsStore: () => void;
}

export const useEZOutputEmissionsStore = create<EZOutputEmissionsStoreState>((set) => ({
  emissionsParagraph1Data: null,
  emissionsParagraph2Data: null,
  emissionsBarChartData: null,
  emissionsPieChartsData: null,

  setEmissionsParagraph1Data: (emissionsParagraph1Data) => set({ emissionsParagraph1Data }),
  setEmissionsParagraph2Data: (emissionsParagraph2Data) => set({ emissionsParagraph2Data }),
  setEmissionsBarChartData: (emissionsBarChartData) => set({ emissionsBarChartData }),
  setEmissionsPieChartsData: (emissionsPieChartsData) => set({ emissionsPieChartsData }),

  resetEmissionsStore: () => set({
    emissionsParagraph1Data: null,
    emissionsParagraph2Data: null,
    emissionsBarChartData: null,
    emissionsPieChartsData: null,
  }),
}));

// === PEOPLE RESPONSE STORE ===

interface EZOutputPeopleResponseStoreState {
  peopleResponseParagraph1Data: EZPeopleResponseParagraph1Data | null;
  peopleResponseParagraph2Data: EZPeopleResponseParagraph2Data | null;
  peopleResponseBreakdownChartData: EZPeopleResponseBreakdownChartData | null;
  peopleResponseTimeImpactChartData: EZPeopleResponseTimeImpactChartData | null;

  setPeopleResponseParagraph1Data: (data: EZPeopleResponseParagraph1Data) => void;
  setPeopleResponseParagraph2Data: (data: EZPeopleResponseParagraph2Data) => void;
  setPeopleResponseBreakdownChartData: (data: EZPeopleResponseBreakdownChartData) => void;
  setPeopleResponseTimeImpactChartData: (data: EZPeopleResponseTimeImpactChartData) => void;

  resetPeopleResponseStore: () => void;
}

export const useEZOutputPeopleResponseStore = create<EZOutputPeopleResponseStoreState>((set) => ({
  peopleResponseParagraph1Data: null,
  peopleResponseParagraph2Data: null,
  peopleResponseBreakdownChartData: null,
  peopleResponseTimeImpactChartData: null,

  setPeopleResponseParagraph1Data: (peopleResponseParagraph1Data) => set({ peopleResponseParagraph1Data }),
  setPeopleResponseParagraph2Data: (peopleResponseParagraph2Data) => set({ peopleResponseParagraph2Data }),
  setPeopleResponseBreakdownChartData: (peopleResponseBreakdownChartData) => set({ peopleResponseBreakdownChartData }),
  setPeopleResponseTimeImpactChartData: (peopleResponseTimeImpactChartData) => set({ peopleResponseTimeImpactChartData }),

  resetPeopleResponseStore: () => set({
    peopleResponseParagraph1Data: null,
    peopleResponseParagraph2Data: null,
    peopleResponseBreakdownChartData: null,
    peopleResponseTimeImpactChartData: null,
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
