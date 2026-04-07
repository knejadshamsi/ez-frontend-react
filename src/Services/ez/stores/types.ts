// ============= SHARED PRIMITIVE TYPES =============
export type OriginType = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

// ============= CONSTANTS =============

// ============= SESSION INTENT =============
export type SessionIntent =
  | 'RUN_NEW_SIMULATION'
  | 'LOAD_PREVIOUS_SCENARIO'
  | 'LOAD_DEMO_SCENARIO'
  | 'VIEW_SCENARIO_OFFLINE';

// ============= SESSION STATE =============
export type SessionState =
  | 'WELCOME'
  | 'SELECT_PARAMETERS'
  | 'VIEW_PARAMETERS'
  | 'VIEW_RESULTS'
  | 'DRAW_EMISSION_ZONE'
  | 'EDIT_EMISSION_ZONE'
  | 'REDRAW_EMISSION_ZONE'
  | 'DRAW_SIMULATION_AREA'
  | 'EDIT_SIMULATION_AREA'
  | 'PROCESS_QUEUED'
  | 'PROCESS_RUNNING'
  | 'PROCESS_COMPLETE'
  | 'PROCESS_ERROR'
  | 'PROCESS_CANCELLING'
  | 'PROCESS_CONNECTION_LOST'
  | 'PROCESS_POLLING';

export const isProcessState = (state: SessionState): boolean =>
  state.startsWith('PROCESS_');

// ============= CONNECTION STATE =============
export type ConnectionState =
  | 'FULL_CONNECT'
  | 'HALF_CONNECT'
  | 'HALF_DISCONNECT'
  | 'FULL_DISCONNECT';

export const transitionConnectionState = (current: ConnectionState, success: boolean): ConnectionState => {
  if (success) {
    switch (current) {
      case 'FULL_CONNECT': return 'FULL_CONNECT';
      case 'HALF_CONNECT': return 'FULL_CONNECT';
      case 'HALF_DISCONNECT': return 'HALF_CONNECT';
      case 'FULL_DISCONNECT': return 'HALF_CONNECT';
    }
  } else {
    switch (current) {
      case 'FULL_CONNECT': return 'HALF_DISCONNECT';
      case 'HALF_CONNECT': return 'HALF_DISCONNECT';
      case 'HALF_DISCONNECT': return 'FULL_DISCONNECT';
      case 'FULL_DISCONNECT': return 'FULL_DISCONNECT';
    }
  }
};

// Temporary alias for files not yet migrated
export type EZStateType = SessionState;

// ============= API PAYLOAD TYPES =============
export type Coordinate = [number, number]; // [longitude, latitude]
export type TripType = 'start' | 'end' | 'pass'; // Which trips to include in simulation
export type PolicyTier = 1 | 2 | 3; // 1: No restrictions , 2: Medium restrictions , 3: banned
export type VehicleTypeId = 'zeroEmission' | 'nearZeroEmission' | 'lowEmission' | 'midEmission' | 'highEmission';

// Vehicle type IDs array (for iteration)
export const VEHICLE_TYPE_IDS: readonly VehicleTypeId[] = [
  'zeroEmission',
  'nearZeroEmission',
  'lowEmission',
  'midEmission',
  'highEmission'
] as const;

// Vehicle type colors (single source of truth)
export const VEHICLE_TYPE_COLORS: Record<VehicleTypeId, string> = {
  zeroEmission: '#34d399',
  nearZeroEmission: '#86efac',
  lowEmission: '#fbbf24',
  midEmission: '#fb923c',
  highEmission: '#ef4444'
} as const;

export interface Policy {
  vehicleType: VehicleTypeId;  // Vehicle type
  tier: PolicyTier;                      // Restriction level
  period: [string, string];              // Time range ["HH:MM", "HH:MM"]
  penalty?: number;                      // Penalty amount for restricted tier (INTEGER, minimum 1)
  interval?: number;                     // Interval in seconds for penalties (INTEGER, default 1800)
}
export interface Zone {
  id: string;                // UUID v4
  coords: Coordinate[][];    // Polygon coordinates (GeoJSON format)
  trip: TripType[];          // Trip types: ['start'] | ['end'] | ['pass'] | combinations
  policies: Policy[];        // Restriction policies (can have multiple)
}

interface SourceDetails {
  year: number;
  name: string;
}
export interface Sources {
  population: SourceDetails;
  network: SourceDetails;
  publicTransport: SourceDetails;
}
export interface SimulationOptions {
  iterations: number;
  percentage: number;
}
export interface CarDistribution {
  zeroEmission: number;
  nearZeroEmission: number;
  lowEmission: number;
  midEmission: number;
  highEmission: number;
}
export interface ModeUtilities {
  walk: number;
  bike: number;
  car: number;
  ev: number;
  subway: number;
  bus: number;
}
export interface CustomSimulationArea {
  id: string;
  coords: Coordinate[][] | null;
}
export interface ScaledSimulationArea {
  id: string;
  zoneId: string;
  coords: Coordinate[][];
}
export interface APIPayload {
  zones: Zone[];
  customSimulationAreas: CustomSimulationArea[];
  scaledSimulationAreas: ScaledSimulationArea[];
  sources: Sources;
  simulationOptions: SimulationOptions;
  carDistribution: CarDistribution;
  modeUtilities: ModeUtilities;
}

// ============= MAIN INPUT PAYLOAD (SIMULATION DATA) =============
export interface MainInputPayload {
  scenarioTitle: string;
  scenarioDescription: string;
  zones: Zone[];
  customSimulationAreas: CustomSimulationArea[];
  scaledSimulationAreas: ScaledSimulationArea[];
  sources: Sources;
  simulationOptions: SimulationOptions;
  carDistribution: CarDistribution;
  modeUtilities: ModeUtilities;
}

// ============= SCENARIO METADATA (UI STATE) =============
export interface ScenarioMetadata {
  // Zone UI metadata
  zoneSessionData: {
    [zoneId: string]: {
      name: string;
      color: string;
      hidden: boolean;
      description?: string;
      scale: [number, OriginType];
    };
  };

  // Display configuration
  simulationAreaDisplay: {
    borderStyle: 'solid' | 'dashed' | 'dotted';
    fillOpacity: number;
  };

  // Car distribution toggles
  carDistributionCategories: {
    zeroEmission: boolean;
    nearZeroEmission: boolean;
    lowEmission: boolean;
    midEmission: boolean;
    highEmission: boolean;
  };

  // Custom/scaled area UI properties
  customAreaSessionData: {
    [areaId: string]: {
      name: string;
      color: string;
    };
  };

  scaledAreaSessionData: {
    [areaId: string]: {
      scale: [number, OriginType];
      color: string;
    };
  };

  // Optional session state
  activeZone?: string | null;
  activeCustomArea?: string | null;
  colorPalette?: string[];
}

// ============= EZ SERVICE STORE INTERFACE =============
export interface EZServiceStore {
  state: SessionState;
  sessionIntent: SessionIntent;
  connectionState: ConnectionState;
  isSseActive: boolean;
  isExiting: boolean;
  isInputDirty: boolean;
  setState: (value: SessionState) => void;
  setSessionIntent: (intent: SessionIntent) => void;
  setConnectionState: (state: ConnectionState) => void;
  setIsSseActive: (active: boolean) => void;
  setIsExiting: (exiting: boolean) => void;
  setIsInputDirty: (dirty: boolean) => void;
  reset: () => void;
}

// ============= API PAYLOAD STORE INTERFACE =============
export interface APIPayloadStore {
  payload: APIPayload;

  addZone: (color: string) => string;
  removeZone: (zoneId: string) => void;
  duplicateZone: (zoneId: string) => void;
  updateZone: (zoneId: string, data: Partial<Zone>) => void;
  reorderZones: (activeId: string, overId: string) => void;

  addCustomSimulationArea: () => string;
  setCustomSimulationAreas: (areas: CustomSimulationArea[]) => void;
  updateCustomSimulationArea: (areaId: string, data: Partial<CustomSimulationArea>) => void;
  removeCustomSimulationArea: (areaId: string) => void;

  addScaledSimulationArea: (zoneId: string, coords: Coordinate[][]) => string;
  setScaledSimulationAreas: (areas: ScaledSimulationArea[]) => void;
  updateScaledSimulationArea: (areaId: string, data: Partial<ScaledSimulationArea>) => void;
  removeScaledSimulationArea: (areaId: string) => void;
  getScaledAreaByZoneId: (zoneId: string) => ScaledSimulationArea | undefined;
  upsertScaledSimulationArea: (zoneId: string, coords: Coordinate[][]) => string;

  setZones: (zones: Zone[]) => void;
  setSources: (sources: Sources) => void;
  setSimulationOptions: (options: SimulationOptions) => void;
  setCarDistribution: (distribution: CarDistribution) => void;
  setModeUtilities: (utilities: ModeUtilities) => void;
  reset: () => void;
}
