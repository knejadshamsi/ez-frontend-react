// ============= CONSTANTS =============
export const DEFAULT_ZONE_ID = 'default-zone-00000000';

// ============= EZ SERVICE STATE TYPES =============
export type EZStateType =
  | "WELCOME"
  | "PARAMETER_SELECTION"
  | "DRAW_EM_ZONE"
  | "EDIT_EM_ZONE"
  | "REDRAW_EM_ZONE"
  | "DRAW_SIM_AREA"
  | "EDIT_SIM_AREA"
  | "AWAIT_RESULTS"
  | "RESULT_VIEW";

// ============= API PAYLOAD TYPES =============
export type Coordinate = [number, number]; // [longitude, latitude]
export type TripType = 'start' | 'end' | 'pass'; // Which trips to include in simulation
export type PolicyTier = 1 | 2 | 3; // 1: No restrictions , 2: Medium restrictions , 3: banned
export interface Policy {
  vehicleType: 'ev' | 'veh' | 'h_veh';  // Vehicle type
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

export interface SourceDetails {
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
  ev: number;
  car: number;
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
  name: string;
  color: string;
}
export interface ScaledSimulationArea {
  id: string;
  zoneId: string;
  coords: Coordinate[][];
  scale: [number, string];
  color: string;
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

// ============= FULL INPUT PAYLOAD (FOR LOADING SCENARIOS) =============
export interface FullInputPayload {
  scenarioTitle: string;
  scenarioDescription: string;
  zones: Zone[];
  customSimulationAreas: CustomSimulationArea[];
  scaledSimulationAreas: ScaledSimulationArea[];
  sources: Sources;
  simulationOptions: SimulationOptions;
  carDistribution: CarDistribution;
  modeUtilities: ModeUtilities;
  zoneSessionData?: { [zoneId: string]: { name: string; color: string; hidden: boolean; description?: string; scale: [number, string] } };
  simulationAreaDisplay: { borderStyle: 'solid' | 'dashed' | 'dotted'; fillOpacity: number };
}

// ============= EZ SERVICE STORE INTERFACE =============
export interface EZServiceStore {
  state: EZStateType;
  isEzBackendAlive: boolean;
  setState: (value: EZStateType) => void;
  setIsEzBackendAlive: (alive: boolean) => void;
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

  addCustomSimulationArea: (color: string) => string;
  updateCustomSimulationArea: (areaId: string, data: Partial<CustomSimulationArea>) => void;
  removeCustomSimulationArea: (areaId: string) => void;

  addScaledSimulationArea: (zoneId: string, coords: Coordinate[][], scale: [number, string], color: string) => string;
  updateScaledSimulationArea: (areaId: string, data: Partial<ScaledSimulationArea>) => void;
  removeScaledSimulationArea: (areaId: string) => void;
  getScaledAreaByZoneId: (zoneId: string) => ScaledSimulationArea | undefined;
  upsertScaledSimulationArea: (zoneId: string, coords: Coordinate[][], scale: [number, string], color: string) => string;

  setZones: (zones: Zone[]) => void;
  setSources: (sources: Sources) => void;
  setSimulationOptions: (options: SimulationOptions) => void;
  setCarDistribution: (distribution: CarDistribution) => void;
  setModeUtilities: (utilities: ModeUtilities) => void;
  reset: () => void;
}
