// Geospatial types
export type Coordinate = [number, number]; // [lng, lat]
export type Polygon = Coordinate[];

// Store types
export type ServiceType = "REST" | "ZELE";

export type ZeleStateType =
  | "WELCOME"
  | "ZONE_SELECTION"
  | "PARAMETER_SELECTION"
  | "LONG_WAIT_WARNING"
  | "INPUT_CONFIRMATION"
  | "WAITING_FOR_RESULT"
  | "RESULT_VIEW"
  | "MAP_VIEW";

// Layer data types
export interface HeatmapDataPoint {
  position: Coordinate;
  weight: number;
}

export interface PathLayerData {
  inbound: number;
  outbound: number;
  path: Coordinate[];
}
