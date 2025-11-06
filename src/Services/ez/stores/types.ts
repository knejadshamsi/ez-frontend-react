// ============= CONSTANTS =============
export const DEFAULT_ZONE_ID = 'default-zone-00000000';

// ============= EZ SERVICE STATE TYPES =============
export type EZStateType =
  | "WELCOME"
  | "PARAMETER_SELECTION"
  | "EMISSION_ZONE_SELECTION"
  | "SIMULATION_AREA_SELECTION"
  | "WAITING_FOR_RESULT"
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
export interface APIPayload {
  zones: Zone[];
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

  addZone: (name: string, color: string) => string;
  removeZone: (zoneId: string) => void;
  duplicateZone: (zoneId: string) => void;
  updateZone: (zoneId: string, data: Partial<Zone>) => void;
  reorderZones: (activeId: string, overId: string) => void;

  setZones: (zones: Zone[]) => void;
  reset: () => void;
}
