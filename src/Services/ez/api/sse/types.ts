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

// Error message payload
interface ErrorMessagePayload {
  message: string;
}

// Overview statistics (SSE: data_text_overview)
interface OverviewPayload {
  personCount: number;
  legCount: number;
  simulationAreaKm2: number;
  networkNodes: number;
  networkLinks: number;
  totalKmTraveled: number;
}

// === EMISSIONS PAYLOADS ===

// Emissions comparison data (SSE: data_text_paragraph1_emissions)
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

// Air quality and vehicle fleet data (SSE: data_text_paragraph2_emissions)
interface EmissionsParagraph2Payload {
  pm25PostPolicy: number;
  zeroEmissionShareBaseline: number;
  zeroEmissionSharePostPolicy: number;
  nearZeroEmissionShareBaseline: number;
  nearZeroEmissionSharePostPolicy: number;
  lowEmissionShareBaseline: number;
  lowEmissionSharePostPolicy: number;
  midEmissionShareBaseline: number;
  midEmissionSharePostPolicy: number;
  highEmissionShareBaseline: number;
  highEmissionSharePostPolicy: number;
}

// Emissions bar chart arrays (SSE: data_chart_bar_emissions)
interface EmissionsBarChartPayload {
  baselineData: number[];
  postPolicyData: number[];
}

// Vehicle emissions pie chart data (SSE: data_chart_pie_emissions)
interface EmissionsPieChartsPayload {
  vehicleBaselineData: number[];
  vehiclePostPolicyData: number[];
}

// === PEOPLE RESPONSE PAYLOADS ===

// Behavioral response percentages (SSE: data_text_paragraph1_people_response)
interface PeopleResponseParagraph1Payload {
  paidPenaltyPct: number;
  reroutedPct: number;
  busPct: number;
  subwayPct: number;
  walkPct: number;
  bikePct: number;
  carPct: number;
  cancelledPct: number;
  penaltyCharges: Array<{ zoneName: string; rate: number }>;
  totalAffectedTrips: number;
}

// Time impact per response type (SSE: data_text_paragraph2_people_response)
interface PeopleResponseParagraph2Payload {
  avgPenaltyTime: number;
  avgRerouteTime: number;
  avgBusTime: number;
  avgSubwayTime: number;
  avgWalkTime: number;
  avgBikeTime: number;
  avgCarTime: number;
}

// Response breakdown chart data (SSE: data_chart_breakdown_people_response, data_chart_time_impact_people_response)
interface PeopleResponseChartPayload {
  data: number[];
}

// === TRIP LEGS PAYLOADS ===

// Trip legs table data (SSE: data_table_trip_legs)
interface TripLegsFirstPagePayload {
  records: Array<{
    legId: string;
    personId: string;
    originActivityType: string;
    destinationActivityType: string;
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
  // Lifecycle events
  | { messageType: 'pa_request_accepted'; payload: StartedPayload; timestamp: string }
  | { messageType: 'pa_simulation_start'; payload: Record<string, never>; timestamp: string }
  | { messageType: 'heartbeat'; payload: Record<string, never>; timestamp: string }
  | { messageType: 'success_process'; payload: Record<string, never>; timestamp: string }
  | { messageType: 'error_global'; payload: ErrorPayload; timestamp: string }

  // Overview data
  | { messageType: 'data_text_overview'; payload: OverviewPayload; timestamp: string }

  // Emissions data
  | { messageType: 'data_text_paragraph1_emissions'; payload: EmissionsParagraph1Payload; timestamp: string }
  | { messageType: 'data_text_paragraph2_emissions'; payload: EmissionsParagraph2Payload; timestamp: string }
  | { messageType: 'data_chart_bar_emissions'; payload: EmissionsBarChartPayload; timestamp: string }
  | { messageType: 'data_chart_pie_emissions'; payload: EmissionsPieChartsPayload; timestamp: string }

  // People response data
  | { messageType: 'data_text_paragraph1_people_response'; payload: PeopleResponseParagraph1Payload; timestamp: string }
  | { messageType: 'data_text_paragraph2_people_response'; payload: PeopleResponseParagraph2Payload; timestamp: string }
  | { messageType: 'data_chart_breakdown_people_response'; payload: PeopleResponseChartPayload; timestamp: string }
  | { messageType: 'data_chart_time_impact_people_response'; payload: PeopleResponseChartPayload; timestamp: string }

  // Trip legs data
  | { messageType: 'data_table_trip_legs'; payload: TripLegsFirstPagePayload; timestamp: string }

  // Map ready signals
  | { messageType: 'success_map_emissions'; payload: Record<string, never>; timestamp: string }
  | { messageType: 'success_map_people_response'; payload: Record<string, never>; timestamp: string }
  | { messageType: 'success_map_trip_legs'; payload: Record<string, never>; timestamp: string }

  // Map errors
  | { messageType: 'error_map_emissions'; payload: ErrorMessagePayload; timestamp: string }
  | { messageType: 'error_map_people_response'; payload: ErrorMessagePayload; timestamp: string }
  | { messageType: 'error_map_trip_legs'; payload: ErrorMessagePayload; timestamp: string }

  // Catch-all for unknown message types
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
  payload: Record<string, unknown> | null;
  method?: 'POST' | 'GET';
  connectionTimeout?: number;
  heartbeatTimeout?: number;
  onStarted?: (requestId: string) => void;
  onSimulationStart?: () => void;
  onComplete?: () => void;
  onError?: (error: SimulationError) => void;
  onTimelineEvent?: (event: string) => void;
}
