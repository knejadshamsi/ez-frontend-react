import type { OriginType } from '~ez/stores/types';

// === SESSION TYPES ===

// Simulation area display configuration
export type BorderStyle = 'dashed' | 'solid' | 'dotted';

export interface SimulationAreaDisplayConfig {
  borderStyle: BorderStyle;
  fillOpacity: number; // 0 = transparent, 51 = lightly colored, 128 = fully colored
}

// Zone session data for individual emission zones
export interface ZoneSessionData {
  name: string;
  color: string;
  hidden: boolean;
  description?: string;
  scale: [number, OriginType];
}

// Custom simulation area session data
export interface CustomAreaSessionData {
  name: string;
  color: string;
}

// Scaled simulation area session data
export interface ScaledAreaSessionData {
  scale: [number, OriginType];
  color: string;
}

// Car distribution categories enable/disable state
export interface CarDistributionCategories {
  zeroEmission: boolean;
  nearZeroEmission: boolean;
  lowEmission: boolean;
  midEmission: boolean;
  highEmission: boolean;
  [key: string]: boolean;
}

// Exit flow state
export type ExitState = 'idle' | 'await_confirmation' | 'resetting';

// Exit warning information
export interface ExitWarning {
  title: string;
  message: string;
}

// Main session store interface
export interface EZSessionStore {
  scenarioTitle: string;
  scenarioDescription: string;
  requestId: string;
  zones: { [zoneId: string]: ZoneSessionData };
  customAreas: { [areaId: string]: CustomAreaSessionData };
  scaledAreas: { [areaId: string]: ScaledAreaSessionData };
  activeZone: string | null;
  activeCustomArea: string | null;
  colorPalette: string[];
  sseCleanup: (() => void) | null;
  isNewSimulation: boolean;
  simulationAreaDisplay: SimulationAreaDisplayConfig;
  carDistributionCategories: CarDistributionCategories;
  pinned: boolean;
  exitState: ExitState;
  exitWarning: ExitWarning | null;

  setScenarioTitle: (title: string) => void;
  setScenarioDescription: (description: string) => void;
  setRequestId: (id: string) => void;
  setZoneProperty: <K extends keyof ZoneSessionData>(zoneId: string, property: K, value: ZoneSessionData[K]) => void;
  setZoneData: (zoneId: string, data: Partial<ZoneSessionData>) => void;
  removeZone: (zoneId: string) => void;
  setCustomAreaData: (areaId: string, data: Partial<CustomAreaSessionData>) => void;
  setCustomAreaProperty: <K extends keyof CustomAreaSessionData>(areaId: string, property: K, value: CustomAreaSessionData[K]) => void;
  removeCustomArea: (areaId: string) => void;
  setScaledAreaData: (areaId: string, data: Partial<ScaledAreaSessionData>) => void;
  setScaledAreaProperty: <K extends keyof ScaledAreaSessionData>(areaId: string, property: K, value: ScaledAreaSessionData[K]) => void;
  removeScaledArea: (areaId: string) => void;
  setActiveZone: (zoneId: string | null) => void;
  setActiveCustomArea: (areaId: string | null) => void;
  nextAvailableColor: () => string;
  setSseCleanup: (cleanup: (() => void) | null) => void;
  abortSseStream: () => void;
  setIsNewSimulation: (value: boolean) => void;
  setSimulationAreaDisplay: (config: Partial<SimulationAreaDisplayConfig>) => void;
  toggleCarDistributionCategory: (category: string) => void;
  setCarDistributionCategories: (categories: CarDistributionCategories) => void;
  setPinned: (pinned: boolean) => void;
  setExitState: (state: ExitState) => void;
  setExitWarning: (warning: ExitWarning | null) => void;
  reset: () => void;
}

// === OUTPUT FILTERS TYPES ===

// Visualization type for emissions map
export type VisualizationType = 'heatmap' | 'hexagon';

// Pollutant type for emissions display
export type PollutantType = 'CO2' | 'NOx' | 'PM2.5' | 'PM10' | 'All';

// Scenario type for baseline/policy toggle
export type EmissionsScenarioType = 'baseline' | 'policy';

// View layer for people response map
export type ResponseLayerView = 'origin' | 'destination';

// People response map categories (4 consolidated categories)
export type PeopleResponseCategory = 'modeShift' | 'rerouted' | 'paidPenalty' | 'cancelled';

// Emissions view mode for private/all toggle
export type EmissionsViewMode = 'private' | 'all';

// Output filters store interface
export interface EZOutputFiltersStore {
  // Map visibility states
  isEmissionsMapVisible: boolean;
  isPeopleResponseMapVisible: boolean;
  isTripLegsMapVisible: boolean;

  // Emissions filter settings
  selectedVisualizationType: VisualizationType;
  selectedPollutantType: PollutantType;
  selectedEmissionsScenario: EmissionsScenarioType;
  emissionsViewMode: EmissionsViewMode;

  // People response filter settings
  selectedResponseLayerView: ResponseLayerView;
  visibleResponseCategories: Set<PeopleResponseCategory>;

  // Trip legs filter settings
  tripLegsViewMode: 'baseline' | 'policy' | 'hidden';

  // Input layer visibility states (output view only)
  inputZoneLayerOpacity: 'hidden' | 'low' | 'medium' | 'normal';
  inputSimulationAreaLayerOpacity: 'hidden' | 'low' | 'medium' | 'normal';

  // Emissions map actions
  toggleEmissionsMapVisibility: () => void;
  setSelectedVisualizationType: (type: VisualizationType) => void;
  setSelectedPollutantType: (type: PollutantType) => void;
  setSelectedEmissionsScenario: (scenario: EmissionsScenarioType) => void;
  setEmissionsViewMode: (mode: EmissionsViewMode) => void;

  // People response map actions
  togglePeopleResponseMapVisibility: () => void;
  setSelectedResponseLayerView: (view: ResponseLayerView) => void;
  toggleResponseCategory: (category: PeopleResponseCategory) => void;

  // Trip legs map actions
  toggleTripLegsMapVisibility: () => void;
  setTripLegsViewMode: (mode: 'baseline' | 'policy' | 'hidden') => void;

  // Input layer actions
  cycleInputZoneLayerOpacity: () => void;
  cycleInputSimulationAreaLayerOpacity: () => void;

  reset: () => void;
}
