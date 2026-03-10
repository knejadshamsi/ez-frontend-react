import { create } from 'zustand';

const DEFAULT_PAGE_SIZE = 10;

import type {
  EZOutputOverviewData,
  EZEmissionsParagraph1Data,
  EZEmissionsParagraph2Data,
  EZEmissionsBarChartData,
  EZEmissionsLineChartData,
  EZEmissionsStackedBarData,
  EZEmissionsWarmColdIntensityData,
  EZPeopleResponseParagraphData,
  EZPeopleResponseSankeyData,
  EZPeopleResponseBarData,
  EZTripLegRecord,
  EZTripLegsPaginationInfo,
  EZTripLegsParagraphData,
  OutputComponentState,
} from './types';

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
  overviewState: 'inactive',
  overviewError: null,

  setOverviewData: (overviewData) => set({ overviewData }),
  setOverviewState: (overviewState) => set({ overviewState }),
  setOverviewError: (overviewError) => set({ overviewError }),
  resetOverviewStore: () => set({
    overviewData: null,
    overviewState: 'inactive',
    overviewError: null,
  }),
}));

// === EMISSIONS STORE ===

interface EZOutputEmissionsStoreState {
  emissionsParagraph1Data: EZEmissionsParagraph1Data | null;
  emissionsParagraph2Data: EZEmissionsParagraph2Data | null;
  emissionsBarChartData: EZEmissionsBarChartData | null;
  emissionsLineChartData: EZEmissionsLineChartData | null;
  emissionsStackedBarData: EZEmissionsStackedBarData | null;
  emissionsWarmColdIntensityData: EZEmissionsWarmColdIntensityData | null;

  emissionsParagraph1State: OutputComponentState;
  emissionsParagraph2State: OutputComponentState;
  emissionsBarChartState: OutputComponentState;
  emissionsLineChartState: OutputComponentState;
  emissionsStackedBarState: OutputComponentState;
  emissionsWarmColdIntensityState: OutputComponentState;

  emissionsParagraph1Error: string | null;
  emissionsParagraph2Error: string | null;
  emissionsBarChartError: string | null;
  emissionsLineChartError: string | null;
  emissionsStackedBarError: string | null;
  emissionsWarmColdIntensityError: string | null;

  setEmissionsParagraph1Data: (data: EZEmissionsParagraph1Data) => void;
  setEmissionsParagraph2Data: (data: EZEmissionsParagraph2Data) => void;
  setEmissionsBarChartData: (data: EZEmissionsBarChartData) => void;
  setEmissionsLineChartData: (data: EZEmissionsLineChartData) => void;
  setEmissionsStackedBarData: (data: EZEmissionsStackedBarData) => void;
  setEmissionsWarmColdIntensityData: (data: EZEmissionsWarmColdIntensityData) => void;

  setEmissionsParagraph1State: (state: OutputComponentState) => void;
  setEmissionsParagraph2State: (state: OutputComponentState) => void;
  setEmissionsBarChartState: (state: OutputComponentState) => void;
  setEmissionsLineChartState: (state: OutputComponentState) => void;
  setEmissionsStackedBarState: (state: OutputComponentState) => void;
  setEmissionsWarmColdIntensityState: (state: OutputComponentState) => void;

  setEmissionsParagraph1Error: (error: string | null) => void;
  setEmissionsParagraph2Error: (error: string | null) => void;
  setEmissionsBarChartError: (error: string | null) => void;
  setEmissionsLineChartError: (error: string | null) => void;
  setEmissionsStackedBarError: (error: string | null) => void;
  setEmissionsWarmColdIntensityError: (error: string | null) => void;

  resetEmissionsStore: () => void;
}

export const useEZOutputEmissionsStore = create<EZOutputEmissionsStoreState>((set) => ({
  emissionsParagraph1Data: null,
  emissionsParagraph2Data: null,
  emissionsBarChartData: null,
  emissionsLineChartData: null,
  emissionsStackedBarData: null,
  emissionsWarmColdIntensityData: null,

  emissionsParagraph1State: 'inactive',
  emissionsParagraph2State: 'inactive',
  emissionsBarChartState: 'inactive',
  emissionsLineChartState: 'inactive',
  emissionsStackedBarState: 'inactive',
  emissionsWarmColdIntensityState: 'inactive',

  emissionsParagraph1Error: null,
  emissionsParagraph2Error: null,
  emissionsBarChartError: null,
  emissionsLineChartError: null,
  emissionsStackedBarError: null,
  emissionsWarmColdIntensityError: null,

  setEmissionsParagraph1Data: (emissionsParagraph1Data) => set({ emissionsParagraph1Data }),
  setEmissionsParagraph2Data: (emissionsParagraph2Data) => set({ emissionsParagraph2Data }),
  setEmissionsBarChartData: (emissionsBarChartData) => set({ emissionsBarChartData }),
  setEmissionsLineChartData: (emissionsLineChartData) => set({ emissionsLineChartData }),
  setEmissionsStackedBarData: (emissionsStackedBarData) => set({ emissionsStackedBarData }),
  setEmissionsWarmColdIntensityData: (emissionsWarmColdIntensityData) => set({ emissionsWarmColdIntensityData }),

  setEmissionsParagraph1State: (emissionsParagraph1State) => set({ emissionsParagraph1State }),
  setEmissionsParagraph2State: (emissionsParagraph2State) => set({ emissionsParagraph2State }),
  setEmissionsBarChartState: (emissionsBarChartState) => set({ emissionsBarChartState }),
  setEmissionsLineChartState: (emissionsLineChartState) => set({ emissionsLineChartState }),
  setEmissionsStackedBarState: (emissionsStackedBarState) => set({ emissionsStackedBarState }),
  setEmissionsWarmColdIntensityState: (emissionsWarmColdIntensityState) => set({ emissionsWarmColdIntensityState }),

  setEmissionsParagraph1Error: (emissionsParagraph1Error) => set({ emissionsParagraph1Error }),
  setEmissionsParagraph2Error: (emissionsParagraph2Error) => set({ emissionsParagraph2Error }),
  setEmissionsBarChartError: (emissionsBarChartError) => set({ emissionsBarChartError }),
  setEmissionsLineChartError: (emissionsLineChartError) => set({ emissionsLineChartError }),
  setEmissionsStackedBarError: (emissionsStackedBarError) => set({ emissionsStackedBarError }),
  setEmissionsWarmColdIntensityError: (emissionsWarmColdIntensityError) => set({ emissionsWarmColdIntensityError }),

  resetEmissionsStore: () => set({
    emissionsParagraph1Data: null,
    emissionsParagraph2Data: null,
    emissionsBarChartData: null,
    emissionsLineChartData: null,
    emissionsStackedBarData: null,
    emissionsWarmColdIntensityData: null,
    emissionsParagraph1State: 'inactive',
    emissionsParagraph2State: 'inactive',
    emissionsBarChartState: 'inactive',
    emissionsLineChartState: 'inactive',
    emissionsStackedBarState: 'inactive',
    emissionsWarmColdIntensityState: 'inactive',
    emissionsParagraph1Error: null,
    emissionsParagraph2Error: null,
    emissionsBarChartError: null,
    emissionsLineChartError: null,
    emissionsStackedBarError: null,
    emissionsWarmColdIntensityError: null,
  }),
}));

// === PEOPLE RESPONSE STORE ===

interface EZOutputPeopleResponseStoreState {
  peopleResponseParagraphData: EZPeopleResponseParagraphData | null;
  peopleResponseSankeyData: EZPeopleResponseSankeyData | null;
  peopleResponseBarData: EZPeopleResponseBarData | null;

  peopleResponseParagraphState: OutputComponentState;
  peopleResponseSankeyState: OutputComponentState;
  peopleResponseBarState: OutputComponentState;

  peopleResponseParagraphError: string | null;
  peopleResponseSankeyError: string | null;
  peopleResponseBarError: string | null;

  setPeopleResponseParagraphData: (data: EZPeopleResponseParagraphData) => void;
  setPeopleResponseSankeyData: (data: EZPeopleResponseSankeyData) => void;
  setPeopleResponseBarData: (data: EZPeopleResponseBarData) => void;

  setPeopleResponseParagraphState: (state: OutputComponentState) => void;
  setPeopleResponseSankeyState: (state: OutputComponentState) => void;
  setPeopleResponseBarState: (state: OutputComponentState) => void;

  setPeopleResponseParagraphError: (error: string | null) => void;
  setPeopleResponseSankeyError: (error: string | null) => void;
  setPeopleResponseBarError: (error: string | null) => void;

  resetPeopleResponseStore: () => void;
}

export const useEZOutputPeopleResponseStore = create<EZOutputPeopleResponseStoreState>((set) => ({
  peopleResponseParagraphData: null,
  peopleResponseSankeyData: null,
  peopleResponseBarData: null,

  peopleResponseParagraphState: 'inactive',
  peopleResponseSankeyState: 'inactive',
  peopleResponseBarState: 'inactive',

  peopleResponseParagraphError: null,
  peopleResponseSankeyError: null,
  peopleResponseBarError: null,

  setPeopleResponseParagraphData: (peopleResponseParagraphData) => set({ peopleResponseParagraphData }),
  setPeopleResponseSankeyData: (peopleResponseSankeyData) => set({ peopleResponseSankeyData }),
  setPeopleResponseBarData: (peopleResponseBarData) => set({ peopleResponseBarData }),

  setPeopleResponseParagraphState: (peopleResponseParagraphState) => set({ peopleResponseParagraphState }),
  setPeopleResponseSankeyState: (peopleResponseSankeyState) => set({ peopleResponseSankeyState }),
  setPeopleResponseBarState: (peopleResponseBarState) => set({ peopleResponseBarState }),

  setPeopleResponseParagraphError: (peopleResponseParagraphError) => set({ peopleResponseParagraphError }),
  setPeopleResponseSankeyError: (peopleResponseSankeyError) => set({ peopleResponseSankeyError }),
  setPeopleResponseBarError: (peopleResponseBarError) => set({ peopleResponseBarError }),

  resetPeopleResponseStore: () => set({
    peopleResponseParagraphData: null,
    peopleResponseSankeyData: null,
    peopleResponseBarData: null,
    peopleResponseParagraphState: 'inactive',
    peopleResponseSankeyState: 'inactive',
    peopleResponseBarState: 'inactive',
    peopleResponseParagraphError: null,
    peopleResponseSankeyError: null,
    peopleResponseBarError: null,
  }),
}));

// === TRIP LEGS STORE ===

interface TripLegsFirstPageData {
  records: EZTripLegRecord[];
  totalRecords: number;
  totalAllRecords: number;
  pageSize: number;
}

interface EZOutputTripLegsStoreState {
  tripLegsParagraphData: EZTripLegsParagraphData | null;
  tripLegsParagraphState: OutputComponentState;
  tripLegsParagraphError: string | null;

  tripLegRecords: EZTripLegRecord[];
  tripLegsPagination: EZTripLegsPaginationInfo | null;
  tripLegsTableState: OutputComponentState;
  tripLegsTableError: string | null;
  excludeNC: boolean;
  selectedTripIds: Set<string>;

  setTripLegsParagraphData: (data: EZTripLegsParagraphData) => void;
  setTripLegsParagraphState: (state: OutputComponentState) => void;
  setTripLegsParagraphError: (error: string | null) => void;

  setTripLegRecords: (records: EZTripLegRecord[]) => void;
  setTripLegsPagination: (pagination: EZTripLegsPaginationInfo) => void;
  setTripLegsTableState: (state: OutputComponentState) => void;
  setTripLegsTableError: (error: string | null) => void;
  setTripLegsFirstPage: (data: TripLegsFirstPageData) => void;
  setTripLegsPage: (page: number, records: EZTripLegRecord[]) => void;
  setExcludeNC: (excludeNC: boolean) => void;
  toggleTripSelection: (legId: string) => void;
  selectAllOnPage: () => void;
  deselectAll: () => void;

  resetTripLegsStore: () => void;
}

export const useEZOutputTripLegsStore = create<EZOutputTripLegsStoreState>((set, get) => ({
  tripLegsParagraphData: null,
  tripLegsParagraphState: 'inactive',
  tripLegsParagraphError: null,

  tripLegRecords: [],
  tripLegsPagination: null,
  tripLegsTableState: 'inactive',
  tripLegsTableError: null,
  excludeNC: true,
  selectedTripIds: new Set<string>(),

  setTripLegsParagraphData: (tripLegsParagraphData) => set({ tripLegsParagraphData }),
  setTripLegsParagraphState: (tripLegsParagraphState) => set({ tripLegsParagraphState }),
  setTripLegsParagraphError: (tripLegsParagraphError) => set({ tripLegsParagraphError }),

  setTripLegRecords: (tripLegRecords) => set({ tripLegRecords }),
  setTripLegsPagination: (tripLegsPagination) => set({ tripLegsPagination }),
  setTripLegsTableState: (tripLegsTableState) => set({ tripLegsTableState }),
  setTripLegsTableError: (tripLegsTableError) => set({ tripLegsTableError }),

  setTripLegsFirstPage: ({ records, totalRecords, totalAllRecords, pageSize }) => set({
    tripLegRecords: records,
    tripLegsPagination: {
      currentPage: 1,
      pageSize,
      totalRecords,
      totalAllRecords,
      totalPages: Math.ceil(totalRecords / pageSize),
    },
    tripLegsTableState: 'success',
  }),

  setTripLegsPage: (page, records) => set((state) => ({
    tripLegRecords: records,
    tripLegsPagination: state.tripLegsPagination
      ? { ...state.tripLegsPagination, currentPage: page }
      : null,
  })),

  setExcludeNC: (excludeNC) => set({
    excludeNC,
    selectedTripIds: new Set<string>(),
  }),

  toggleTripSelection: (legId) => set((state) => {
    const newIds = new Set(state.selectedTripIds);
    if (newIds.has(legId)) {
      newIds.delete(legId);
    } else {
      const pageSize = state.tripLegsPagination?.pageSize ?? DEFAULT_PAGE_SIZE;
      if (newIds.size >= pageSize) return state;
      newIds.add(legId);
    }
    return { selectedTripIds: newIds };
  }),

  selectAllOnPage: () => set((state) => {
    const newIds = new Set(state.selectedTripIds);
    for (const record of state.tripLegRecords) {
      newIds.add(record.legId);
    }
    return { selectedTripIds: newIds };
  }),

  deselectAll: () => set({ selectedTripIds: new Set<string>() }),

  resetTripLegsStore: () => set({
    tripLegsParagraphData: null,
    tripLegsParagraphState: 'inactive',
    tripLegsParagraphError: null,
    tripLegRecords: [],
    tripLegsPagination: null,
    tripLegsTableState: 'inactive',
    tripLegsTableError: null,
    excludeNC: true,
    selectedTripIds: new Set<string>(),
  }),
}));

