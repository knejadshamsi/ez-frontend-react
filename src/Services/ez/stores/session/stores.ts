import { create } from 'zustand';
import { DEFAULT_ZONE_ID } from '../types';
import type {
  ZoneSessionData,
  EZSessionStore,
  EZOutputFiltersStore,
  VisualizationType,
  PollutantType,
  ResponseLayerView,
  BehavioralResponseType,
} from './types';
import {
  DEFAULT_SCENARIO_TITLE,
  DEFAULT_SCENARIO_DESCRIPTION,
  DEFAULT_REQUEST_ID,
  COLOR_PALETTE,
  DEFAULT_ZONE_SESSION_DATA,
  DEFAULT_SIMULATION_AREA_DISPLAY,
  DEFAULT_VISUALIZATION_TYPE,
  DEFAULT_POLLUTANT_TYPE,
  DEFAULT_RESPONSE_VIEW,
  DEFAULT_BEHAVIORAL_RESPONSE,
  DEFAULT_CAR_DISTRIBUTION_CATEGORIES,
} from './defaults';
import { useAPIPayloadStore } from '../index';
import type { CarDistribution } from '../types';

const MINIMUM_PERCENTAGE = 5;

const findBiggestCategory = (
  distribution: CarDistribution,
  enabledCategories: Record<string, boolean>,
  excludeCategory?: string
): { key: string; value: number } => {
  return Object.entries(distribution)
    .filter(([key]) => enabledCategories[key] && key !== excludeCategory)
    .reduce(
      (max, [key, value]) => (value > max.value ? { key, value } : max),
      { key: '', value: 0 }
    );
};

const redistributeOnDisable = (
  distribution: CarDistribution,
  disabledCategory: string,
  enabledCategories: Record<string, boolean>
): CarDistribution => {
  const removedPercentage = distribution[disabledCategory];
  const biggest = findBiggestCategory(distribution, enabledCategories, disabledCategory);

  return {
    ...distribution,
    [biggest.key]: distribution[biggest.key] + removedPercentage,
    [disabledCategory]: 0
  };
};

const redistributeOnEnable = (
  distribution: CarDistribution,
  enabledCategory: string,
  enabledCategories: Record<string, boolean>,
  minimumPercentage: number = MINIMUM_PERCENTAGE
): CarDistribution => {
  const biggest = findBiggestCategory(distribution, enabledCategories);

  return {
    ...distribution,
    [biggest.key]: distribution[biggest.key] - minimumPercentage,
    [enabledCategory]: minimumPercentage
  };
};

// === SESSION STORE ===

const createInitialState = () => ({
  scenarioTitle: DEFAULT_SCENARIO_TITLE,
  scenarioDescription: DEFAULT_SCENARIO_DESCRIPTION,
  requestId: DEFAULT_REQUEST_ID,
  zones: {
    [DEFAULT_ZONE_ID]: DEFAULT_ZONE_SESSION_DATA
  },
  activeZone: DEFAULT_ZONE_ID,
  activeCustomArea: null as string | null,
  colorPalette: [...COLOR_PALETTE],
  sseCleanup: null as (() => void) | null,
  isNewSimulation: true,
  simulationAreaDisplay: { ...DEFAULT_SIMULATION_AREA_DISPLAY },
  carDistributionCategories: { ...DEFAULT_CAR_DISTRIBUTION_CATEGORIES },
});

export const useEZSessionStore = create<EZSessionStore>((set, get) => ({
  ...createInitialState(),

  setScenarioTitle: (scenarioTitle: string) =>
    set({ scenarioTitle: scenarioTitle.slice(0, 50) }),

  setScenarioDescription: (scenarioDescription: string) =>
    set({ scenarioDescription }),

  setRequestId: (requestId: string) =>
    set({ requestId }),

  setZoneProperty: (zoneId: string, property: keyof ZoneSessionData, value: any) =>
    set((state) => ({
      zones: {
        ...state.zones,
        [zoneId]: {
          ...state.zones[zoneId],
          [property]: value
        }
      }
    })),

  setZoneData: (zoneId: string, data: Partial<ZoneSessionData>) =>
    set((state) => ({
      zones: {
        ...state.zones,
        [zoneId]: {
          ...state.zones[zoneId],
          ...data
        }
      }
    })),

  removeZone: (zoneId: string) =>
    set((state) => {
      const newZones = { ...state.zones };
      delete newZones[zoneId];
      return { zones: newZones };
    }),

  setActiveZone: (activeZone: string | null) =>
    set({ activeZone }),

  setActiveCustomArea: (activeCustomArea: string | null) =>
    set({ activeCustomArea }),

  nextAvailableColor: () => {
    const state = get();
    const randomIndex = Math.floor(Math.random() * state.colorPalette.length);
    return state.colorPalette[randomIndex];
  },

  setSseCleanup: (sseCleanup: (() => void) | null) =>
    set({ sseCleanup }),

  abortSseStream: () => {
    const state = get();
    if (state.sseCleanup) {
      state.sseCleanup();
      set({ sseCleanup: null });
    }
  },

  setIsNewSimulation: (isNewSimulation: boolean) =>
    set({ isNewSimulation }),

  setSimulationAreaDisplay: (config) =>
    set((state) => ({
      simulationAreaDisplay: {
        ...state.simulationAreaDisplay,
        ...config
      }
    })),

  toggleCarDistributionCategory: (category: string) => {
    const state = get();
    const payloadStore = useAPIPayloadStore.getState();
    const currentDistribution = payloadStore.payload.carDistribution;

    const isCurrentlyEnabled = state.carDistributionCategories[category];

    if (isCurrentlyEnabled) {
      // === DISABLING ===

      // Check: at least 1 must remain enabled
      const enabledCount = Object.values(state.carDistributionCategories).filter(v => v).length;

      if (enabledCount <= 1) {
        // Do nothing - component will handle warning message
        return;
      }

      // Use utility function to redistribute
      const newDistribution = redistributeOnDisable(
        currentDistribution,
        category,
        state.carDistributionCategories
      );

      payloadStore.setCarDistribution(newDistribution);

      // Update session
      set((state) => ({
        carDistributionCategories: {
          ...state.carDistributionCategories,
          [category]: false
        }
      }));

    } else {
      // === RE-ENABLING ===

      // Use utility function to redistribute
      const newDistribution = redistributeOnEnable(
        currentDistribution,
        category,
        state.carDistributionCategories,
        MINIMUM_PERCENTAGE
      );

      payloadStore.setCarDistribution(newDistribution);

      // Update session
      set((state) => ({
        carDistributionCategories: {
          ...state.carDistributionCategories,
          [category]: true
        }
      }));
    }
  },

  reset: () => {
    set(createInitialState());
  },
}));

// === OUTPUT FILTERS STORE ===

const createInitialFiltersState = () => ({
  isEmissionsMapVisible: false,
  isPeopleResponseMapVisible: false,
  isTripLegsMapVisible: false,
  selectedVisualizationType: DEFAULT_VISUALIZATION_TYPE,
  selectedPollutantType: DEFAULT_POLLUTANT_TYPE,
  selectedResponseLayerView: DEFAULT_RESPONSE_VIEW,
  selectedBehavioralResponseType: DEFAULT_BEHAVIORAL_RESPONSE,
  visibleTripLegIds: new Set<string>(),
});

export const useEZOutputFiltersStore = create<EZOutputFiltersStore>((set) => ({
  ...createInitialFiltersState(),

  toggleEmissionsMapVisibility: () =>
    set((state) => ({ isEmissionsMapVisible: !state.isEmissionsMapVisible })),

  setSelectedVisualizationType: (selectedVisualizationType: VisualizationType) =>
    set({ selectedVisualizationType }),

  setSelectedPollutantType: (selectedPollutantType: PollutantType) =>
    set({ selectedPollutantType }),

  togglePeopleResponseMapVisibility: () =>
    set((state) => ({ isPeopleResponseMapVisible: !state.isPeopleResponseMapVisible })),

  setSelectedResponseLayerView: (selectedResponseLayerView: ResponseLayerView) =>
    set({ selectedResponseLayerView }),

  setSelectedBehavioralResponseType: (selectedBehavioralResponseType: BehavioralResponseType) =>
    set({ selectedBehavioralResponseType }),

  toggleTripLegsMapVisibility: () =>
    set((state) => ({ isTripLegsMapVisible: !state.isTripLegsMapVisible })),

  toggleTripLegVisibility: (legId: string) =>
    set((state) => {
      const newVisibleIds = new Set(state.visibleTripLegIds);
      if (newVisibleIds.has(legId)) {
        newVisibleIds.delete(legId);
      } else {
        newVisibleIds.add(legId);
      }
      return { visibleTripLegIds: newVisibleIds };
    }),

  showAllTripLegs: (legIds: string[]) =>
    set({ visibleTripLegIds: new Set(legIds) }),

  hideAllTripLegs: () =>
    set({ visibleTripLegIds: new Set<string>() }),

  reset: () => {
    set(createInitialFiltersState());
  },
}));
