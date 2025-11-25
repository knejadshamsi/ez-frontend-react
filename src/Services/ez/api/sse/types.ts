// === PAYLOAD TYPES ===

// Connection lifecycle payloads
interface StartedPayload {
  requestId: string;
}

interface ErrorPayload {
  code: string;
  message: string;
  details?: string;
}

// Overview statistics (SSE: data_overview)
interface OverviewPayload {
  personCount: number;
  legCount: number;
  simulationAreaKm2: number;
  networkNodes: number;
  networkLinks: number;
  totalKmTraveled: number;
}

// === EMISSIONS PAYLOADS ===

// Emissions comparison data (SSE: data_emissions_paragraph1)
interface EmissionsParagraph1Payload {
  co2Baseline: number;
  co2PostPolicy: number;
  pm25Baseline: number;
  pm25PostPolicy: number;
  noxBaseline: number;
  noxPostPolicy: number;
  pm10Baseline: number;
  pm10PostPolicy: number;
  modeShiftPercentage: number;
}

// Air quality and vehicle fleet data (SSE: data_emissions_paragraph2)
interface EmissionsParagraph2Payload {
  pm25PostPolicy: number;
  zoneArea: number;
  mixingHeight: number;
  evShareBaseline: number;
  evSharePostPolicy: number;
  standardShareBaseline: number;
  standardSharePostPolicy: number;
  heavyShareBaseline: number;
  heavySharePostPolicy: number;
}

// Emissions bar chart arrays (SSE: data_emissions_bar_chart)
interface EmissionsBarChartPayload {
  baselineData: number[];
  postPolicyData: number[];
}

// Vehicle emissions pie chart data (SSE: data_emissions_pie_charts)
interface EmissionsPieChartsPayload {
  vehicleBaselineData: number[];
  vehiclePostPolicyData: number[];
}

// === PEOPLE RESPONSE PAYLOADS ===

// Behavioral response percentages (SSE: data_people_response_paragraph1)
interface PeopleResponseParagraph1Payload {
  paidPenaltyPct: number;
  reroutedPct: number;
  busPct: number;
  subwayPct: number;
  walkPct: number;
  bikePct: number;
  cancelledPct: number;
  penaltyCharge: number;
  totalAffectedTrips: number;
}

// Time impact per response type (SSE: data_people_response_paragraph2)
interface PeopleResponseParagraph2Payload {
  avgPenaltyTime: number;
  avgRerouteTime: number;
  avgBusTime: number;
  avgSubwayTime: number;
  avgWalkTime: number;
  avgBikeTime: number;
}

// Response breakdown chart data (SSE: data_people_response_breakdown, data_people_response_time_impact)
interface PeopleResponseChartPayload {
  data: number[];
}

// === TRIP LEGS PAYLOADS ===

// First page of trip legs (SSE: data_trip_legs_first_page)
interface TripLegsFirstPagePayload {
  records: Array<{
    legId: string;
    personId: string;
    originActivity: string;
    destinationActivity: string;
    co2DeltaGrams: number;
    timeDeltaMinutes: number;
    impact: string;
  }>;
  totalRecords: number;
  pageSize: number;
}

// === SSE MESSAGE PROTOCOL ===

// Discriminated union for all SSE message types
export type SSEMessage =
  | { messageType: 'started'; payload: StartedPayload; timestamp: string }
  | { messageType: 'heartbeat'; payload: Record<string, never>; timestamp: string }
  | { messageType: 'complete'; payload: Record<string, never>; timestamp: string }
  | { messageType: 'error'; payload: ErrorPayload; timestamp: string }
  | { messageType: 'data_overview'; payload: OverviewPayload; timestamp: string }
  | { messageType: 'data_emissions_paragraph1'; payload: EmissionsParagraph1Payload; timestamp: string }
  | { messageType: 'data_emissions_paragraph2'; payload: EmissionsParagraph2Payload; timestamp: string }
  | { messageType: 'data_emissions_bar_chart'; payload: EmissionsBarChartPayload; timestamp: string }
  | { messageType: 'data_emissions_pie_charts'; payload: EmissionsPieChartsPayload; timestamp: string }
  | { messageType: 'data_people_response_paragraph1'; payload: PeopleResponseParagraph1Payload; timestamp: string }
  | { messageType: 'data_people_response_paragraph2'; payload: PeopleResponseParagraph2Payload; timestamp: string }
  | { messageType: 'data_people_response_breakdown'; payload: PeopleResponseChartPayload; timestamp: string }
  | { messageType: 'data_people_response_time_impact'; payload: PeopleResponseChartPayload; timestamp: string }
  | { messageType: 'data_trip_legs_first_page'; payload: TripLegsFirstPagePayload; timestamp: string }
  | { messageType: 'map_ready_emissions'; payload: Record<string, never>; timestamp: string }
  | { messageType: 'map_ready_people_response'; payload: Record<string, never>; timestamp: string }
  | { messageType: 'map_ready_trip_legs'; payload: Record<string, never>; timestamp: string }
  | { messageType: string; payload: Record<string, unknown>; timestamp: string };

// === EXTERNAL API TYPES ===

// Error structure for consumer callbacks
export interface SimulationError {
  code: string;
  message: string;
  details?: string;
}

// Configuration for SSE stream connection
export interface SimulationStreamConfig {
  endpoint: string;
  payload: Record<string, unknown>;
  connectionTimeout?: number;
  heartbeatTimeout?: number;
  onStarted?: (requestId: string) => void;
  onComplete?: () => void;
  onError?: (error: SimulationError) => void;
  onTimelineEvent?: (event: string) => void;
}
