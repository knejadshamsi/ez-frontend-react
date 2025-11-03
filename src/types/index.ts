export type Coordinate = [number, number];
export type Polygon = Coordinate[];

export type ServiceType = "REST" | "ZELE" | "EZ";

export type ZeleStateType =
  | "WELCOME"
  | "ZONE_SELECTION"
  | "PARAMETER_SELECTION"
  | "LONG_WAIT_WARNING"
  | "INPUT_CONFIRMATION"
  | "WAITING_FOR_RESULT"
  | "RESULT_VIEW"
  | "MAP_VIEW";

export interface HeatmapDataPoint {
  position: Coordinate;
  weight: number;
}

export interface PathLayerData {
  inbound: number;
  outbound: number;
  path: Coordinate[];
}
