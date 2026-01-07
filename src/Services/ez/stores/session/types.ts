// === SESSION TYPES ===

/* Simulation area display configuration */
export type BorderStyle = 'dashed' | 'solid' | 'dotted';

export interface SimulationAreaDisplayConfig {
  borderStyle: BorderStyle;
  fillOpacity: number; // 0 = transparent, 51 = lightly colored, 128 = fully colored
}

/* Zone session data for individual emission zones */
export interface ZoneSessionData {
  name: string;
  color: string;
  hidden: boolean;
  description?: string;
  scale: [number, string];
}

/* Car distribution categories enable/disable state */
export interface CarDistributionCategories {
  zeroEmission: boolean;
  nearZeroEmission: boolean;
  lowEmission: boolean;
  midEmission: boolean;
  highEmission: boolean;
  [key: string]: boolean;
}

/* Main session store interface */
export interface EZSessionStore {
  scenarioTitle: string;
  scenarioDescription: string;
  requestId: string;
  zones: { [zoneId: string]: ZoneSessionData };
  activeZone: string | null;
  activeCustomArea: string | null;
  colorPalette: string[];
  sseCleanup: (() => void) | null;
  isNewSimulation: boolean;
  simulationAreaDisplay: SimulationAreaDisplayConfig;
  carDistributionCategories: CarDistributionCategories;

  setScenarioTitle: (title: string) => void;
  setScenarioDescription: (description: string) => void;
  setRequestId: (id: string) => void;
  setZoneProperty: (zoneId: string, property: keyof ZoneSessionData, value: any) => void;
  setZoneData: (zoneId: string, data: Partial<ZoneSessionData>) => void;
  removeZone: (zoneId: string) => void;
  setActiveZone: (zoneId: string | null) => void;
  setActiveCustomArea: (areaId: string | null) => void;
  nextAvailableColor: () => string;
  setSseCleanup: (cleanup: (() => void) | null) => void;
  abortSseStream: () => void;
  setIsNewSimulation: (value: boolean) => void;
  setSimulationAreaDisplay: (config: Partial<SimulationAreaDisplayConfig>) => void;
  toggleCarDistributionCategory: (category: string) => void;
  reset: () => void;
}

// === OUTPUT FILTERS TYPES ===

/* Visualization type for emissions map */
export type VisualizationType = 'heatmap' | 'hexagon';

/* Pollutant type for emissions display */
export type PollutantType = 'CO2' | 'NOx' | 'PM2.5' | 'PM10';

/* View layer for people response map */
export type ResponseLayerView = 'origin' | 'destination';

/* Behavioral response categories */
export type BehavioralResponseType =
  | 'paidPenalty'
  | 'rerouted'
  | 'switchedToBus'
  | 'switchedToSubway'
  | 'switchedToWalking'
  | 'switchedToBiking'
  | 'cancelledTrip';

/* Output filters store interface */
export interface EZOutputFiltersStore {
  /* Map visibility states */
  isEmissionsMapVisible: boolean;
  isPeopleResponseMapVisible: boolean;
  isTripLegsMapVisible: boolean;

  /* Emissions filter settings */
  selectedVisualizationType: VisualizationType;
  selectedPollutantType: PollutantType;

  /* People response filter settings */
  selectedResponseLayerView: ResponseLayerView;
  selectedBehavioralResponseType: BehavioralResponseType;

  /* Trip legs filter settings */
  visibleTripLegIds: Set<string>;

  /* Emissions map actions */
  toggleEmissionsMapVisibility: () => void;
  setSelectedVisualizationType: (type: VisualizationType) => void;
  setSelectedPollutantType: (type: PollutantType) => void;

  /* People response map actions */
  togglePeopleResponseMapVisibility: () => void;
  setSelectedResponseLayerView: (view: ResponseLayerView) => void;
  setSelectedBehavioralResponseType: (type: BehavioralResponseType) => void;

  /* Trip legs map actions */
  toggleTripLegsMapVisibility: () => void;
  toggleTripLegVisibility: (legId: string) => void;
  showAllTripLegs: (legIds: string[]) => void;
  hideAllTripLegs: () => void;

  reset: () => void;
}
