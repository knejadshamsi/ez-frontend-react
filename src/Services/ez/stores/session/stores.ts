import { create } from 'zustand';
import { DEFAULT_ZONE_ID } from '../defaults';
import type {
  ZoneSessionData,
  CustomAreaSessionData,
  ScaledAreaSessionData,
  EZSessionStore,
  EZOutputFiltersStore,
  VisualizationType,
  PollutantType,
  EmissionsScenarioType,
  EmissionsViewMode,
  ResponseLayerView,
  PeopleResponseCategory,
  ExitWarning,
  ExitState,
} from './types';
import { OPACITY_STATES, type OpacityState } from '~utils/opacityMapping';
import {
  DEFAULT_SCENARIO_TITLE,
  DEFAULT_SCENARIO_DESCRIPTION,
  DEFAULT_REQUEST_ID,
  COLOR_PALETTE,
  DEFAULT_ZONE_SESSION_DATA,
  DEFAULT_SIMULATION_AREA_DISPLAY,
  DEFAULT_VISUALIZATION_TYPE,
  DEFAULT_POLLUTANT_TYPE,
  DEFAULT_EMISSIONS_SCENARIO,
  DEFAULT_RESPONSE_VIEW,
  DEFAULT_VISIBLE_RESPONSE_CATEGORIES,
  DEFAULT_CAR_DISTRIBUTION_CATEGORIES,
} from './defaults';
import { useAPIPayloadStore } from '../index';
import type { CarDistribution } from '../types';

const MINIMUM_PERCENTAGE = 5;
const MAX_SCENARIO_TITLE_LENGTH = 50;

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

export const createInitialSessionState = () => ({
  scenarioTitle: DEFAULT_SCENARIO_TITLE,
  scenarioDescription: DEFAULT_SCENARIO_DESCRIPTION,
  requestId: DEFAULT_REQUEST_ID,
  zones: {
    [DEFAULT_ZONE_ID]: DEFAULT_ZONE_SESSION_DATA
  },
  customAreas: {} as Record<string, CustomAreaSessionData>,
  scaledAreas: {} as Record<string, ScaledAreaSessionData>,
  activeZone: DEFAULT_ZONE_ID,
  activeCustomArea: null,
  colorPalette: [...COLOR_PALETTE],
  sseCleanup: null,
  isNewSimulation: true,
  simulationAreaDisplay: { ...DEFAULT_SIMULATION_AREA_DISPLAY },
  carDistributionCategories: { ...DEFAULT_CAR_DISTRIBUTION_CATEGORIES },
  exitState: 'idle',
  exitWarning: null,
});

export const useEZSessionStore = create<EZSessionStore>((set, get) => ({
  ...createInitialSessionState(),

  setScenarioTitle: (scenarioTitle: string) =>
    set({ scenarioTitle: scenarioTitle.slice(0, MAX_SCENARIO_TITLE_LENGTH) }),

  setScenarioDescription: (scenarioDescription: string) =>
    set({ scenarioDescription }),

  setRequestId: (requestId: string) =>
    set({ requestId }),

  setZoneProperty: <K extends keyof ZoneSessionData>(zoneId: string, property: K, value: ZoneSessionData[K]) =>
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

  setCustomAreaData: (areaId: string, data: Partial<CustomAreaSessionData>) =>
    set((state) => ({
      customAreas: {
        ...state.customAreas,
        [areaId]: {
          ...state.customAreas[areaId],
          ...data
        }
      }
    })),

  setCustomAreaProperty: <K extends keyof CustomAreaSessionData>(areaId: string, property: K, value: CustomAreaSessionData[K]) =>
    set((state) => ({
      customAreas: {
        ...state.customAreas,
        [areaId]: {
          ...state.customAreas[areaId],
          [property]: value
        }
      }
    })),

  removeCustomArea: (areaId: string) =>
    set((state) => {
      const newCustomAreas = { ...state.customAreas };
      delete newCustomAreas[areaId];
      return { customAreas: newCustomAreas };
    }),

  setScaledAreaData: (areaId: string, data: Partial<ScaledAreaSessionData>) =>
    set((state) => ({
      scaledAreas: {
        ...state.scaledAreas,
        [areaId]: {
          ...state.scaledAreas[areaId],
          ...data
        }
      }
    })),

  setScaledAreaProperty: <K extends keyof ScaledAreaSessionData>(areaId: string, property: K, value: ScaledAreaSessionData[K]) =>
    set((state) => ({
      scaledAreas: {
        ...state.scaledAreas,
        [areaId]: {
          ...state.scaledAreas[areaId],
          [property]: value
        }
      }
    })),

  removeScaledArea: (areaId: string) =>
    set((state) => {
      const newScaledAreas = { ...state.scaledAreas };
      delete newScaledAreas[areaId];
      return { scaledAreas: newScaledAreas };
    }),

  setActiveZone: (activeZone: string | null) =>
    set({ activeZone }),

  setActiveCustomArea: (activeCustomArea: string | null) =>
    set({ activeCustomArea }),

  nextAvailableColor: () => {
    const state = get();

    // Get the ordered zones array from API payload store
    const apiPayloadZones = useAPIPayloadStore.getState().payload.zones;

    // Get the last zone's ID (most recently added)
    const lastZone = apiPayloadZones[apiPayloadZones.length - 1];
    const lastZoneId = lastZone.id;

    // Get the last zone's color from session store
    const lastZoneColor = state.zones[lastZoneId]?.color;

    // If we can't find the last zone's color, pick any color (safety fallback)
    if (!lastZoneColor) {
      const randomIndex = Math.floor(Math.random() * state.colorPalette.length);
      return state.colorPalette[randomIndex];
    }

    // Filter out the last zone's color from available colors
    const availableColors = state.colorPalette.filter(color => color !== lastZoneColor);

    // Pick randomly from remaining colors
    const randomIndex = Math.floor(Math.random() * availableColors.length);
    return availableColors[randomIndex];
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
      set((s) => ({
        carDistributionCategories: {
          ...s.carDistributionCategories,
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
      set((s) => ({
        carDistributionCategories: {
          ...s.carDistributionCategories,
          [category]: true
        }
      }));
    }
  },

  setExitState: (exitState: ExitState) =>
    set({ exitState }),

  setExitWarning: (exitWarning: ExitWarning | null) =>
    set({ exitWarning }),

  reset: () => {
    const { exitState, exitWarning } = get();
    set({
      ...createInitialSessionState(),
      exitState,
      exitWarning
    });
  },
}));

// === OUTPUT FILTERS STORE ===

const createInitialFiltersState = () => ({
  isEmissionsMapVisible: false,
  isPeopleResponseMapVisible: false,
  isTripLegsMapVisible: false,
  selectedVisualizationType: DEFAULT_VISUALIZATION_TYPE,
  selectedPollutantType: DEFAULT_POLLUTANT_TYPE,
  selectedEmissionsScenario: DEFAULT_EMISSIONS_SCENARIO,
  emissionsViewMode: 'private',
  selectedResponseLayerView: DEFAULT_RESPONSE_VIEW,
  visibleResponseCategories: new Set(DEFAULT_VISIBLE_RESPONSE_CATEGORIES),
  tripLegsViewMode: 'baseline',
  inputZoneLayerOpacity: OPACITY_STATES.HIDDEN,
  inputSimulationAreaLayerOpacity: OPACITY_STATES.HIDDEN,
});

const cycleOpacity = (current: OpacityState): OpacityState => {
  const cycle: OpacityState[] = [OPACITY_STATES.HIDDEN, OPACITY_STATES.LOW, OPACITY_STATES.MEDIUM, OPACITY_STATES.NORMAL];
  return cycle[(cycle.indexOf(current) + 1) % cycle.length];
};

export const useEZOutputFiltersStore = create<EZOutputFiltersStore>((set) => ({
  ...createInitialFiltersState(),

  toggleEmissionsMapVisibility: () =>
    set((state) => ({ isEmissionsMapVisible: !state.isEmissionsMapVisible })),

  setSelectedVisualizationType: (selectedVisualizationType: VisualizationType) =>
    set({ selectedVisualizationType }),

  setSelectedPollutantType: (selectedPollutantType: PollutantType) =>
    set({ selectedPollutantType }),

  setSelectedEmissionsScenario: (selectedEmissionsScenario: EmissionsScenarioType) =>
    set({ selectedEmissionsScenario }),

  setEmissionsViewMode: (emissionsViewMode: EmissionsViewMode) =>
    set({ emissionsViewMode }),

  togglePeopleResponseMapVisibility: () =>
    set((state) => ({ isPeopleResponseMapVisible: !state.isPeopleResponseMapVisible })),

  setSelectedResponseLayerView: (selectedResponseLayerView: ResponseLayerView) =>
    set({ selectedResponseLayerView }),

  toggleResponseCategory: (category: PeopleResponseCategory) =>
    set((state) => {
      const newCategories = new Set(state.visibleResponseCategories);
      if (newCategories.has(category)) {
        newCategories.delete(category);
      } else {
        newCategories.add(category);
      }
      return { visibleResponseCategories: newCategories };
    }),

  toggleTripLegsMapVisibility: () =>
    set((state) => ({ isTripLegsMapVisible: !state.isTripLegsMapVisible })),

  setTripLegsViewMode: (tripLegsViewMode: 'baseline' | 'policy' | 'hidden') =>
    set({ tripLegsViewMode }),

  cycleInputZoneLayerOpacity: () =>
    set((state) => ({ inputZoneLayerOpacity: cycleOpacity(state.inputZoneLayerOpacity) })),

  cycleInputSimulationAreaLayerOpacity: () =>
    set((state) => ({ inputSimulationAreaLayerOpacity: cycleOpacity(state.inputSimulationAreaLayerOpacity) })),

  reset: () => {
    set(createInitialFiltersState());
  },
}));

// === DRAFT STORE ===

interface DraftStore {
  draftId: string | null;
  setDraftId: (draftId: string | null) => void;
  reset: () => void;
}

export const useDraftStore = create<DraftStore>((set) => ({
  draftId: null,
  setDraftId: (draftId) => set({ draftId }),
  reset: () => set({ draftId: null }),
}));
