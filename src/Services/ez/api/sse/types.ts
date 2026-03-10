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

// Emissions pollutant totals and deltas (SSE: data_text_paragraph1_emissions, data_chart_bar_emissions)
interface EmissionsParagraph1Payload {
  // Combined (private scaled + transit)
  co2Baseline: number; co2Policy: number; co2DeltaPercent: number;
  noxBaseline: number; noxPolicy: number; noxDeltaPercent: number;
  pm25Baseline: number; pm25Policy: number; pm25DeltaPercent: number;
  pm10Baseline: number; pm10Policy: number; pm10DeltaPercent: number;
  // Private vehicle only (scaled)
  privateCo2Baseline: number; privateCo2Policy: number; privateCo2DeltaPercent: number;
  privateNoxBaseline: number; privateNoxPolicy: number; privateNoxDeltaPercent: number;
  privatePm25Baseline: number; privatePm25Policy: number; privatePm25DeltaPercent: number;
  privatePm10Baseline: number; privatePm10Policy: number; privatePm10DeltaPercent: number;
  // Transit only (context)
  transitCo2Baseline: number; transitCo2Policy: number;
  transitNoxBaseline: number; transitNoxPolicy: number;
  transitPm25Baseline: number; transitPm25Policy: number;
  transitPm10Baseline: number; transitPm10Policy: number;
}

// PM2.5 spatial density (SSE: data_text_paragraph2_emissions)
interface EmissionsParagraph2Payload {
  pm25PerKm2Baseline: number;
  pm25PerKm2Policy: number;
  zoneAreaKm2: number;
  mixingHeightMeters: number;
}

// Time-binned emissions (SSE: data_chart_line_emissions)
interface EmissionsLineChartPayload {
  timeBins: string[];
  co2Baseline: number[];
  co2Policy: number[];
  noxBaseline: number[];
  noxPolicy: number[];
  pm25Baseline: number[];
  pm25Policy: number[];
  pm10Baseline: number[];
  pm10Policy: number[];
}

// Emissions by vehicle type (SSE: data_chart_stacked_bar_emissions)
interface EmissionsStackedBarPayload {
  baseline: {
    private: {
      co2ByType: Record<string, number>;
      noxByType: Record<string, number>;
      pm25ByType: Record<string, number>;
      pm10ByType: Record<string, number>;
    };
    transit: { co2: number; nox: number; pm25: number; pm10: number };
  };
  policy: {
    private: {
      co2ByType: Record<string, number>;
      noxByType: Record<string, number>;
      pm25ByType: Record<string, number>;
      pm10ByType: Record<string, number>;
    };
    transit: { co2: number; nox: number; pm25: number; pm10: number };
  };
}

// Warm/cold split + CO2 intensity (SSE: data_warm_cold_intensity_emissions)
interface WarmColdIntensityPayload {
  warmCold: {
    warmBaseline: number;
    coldBaseline: number;
    warmPolicy: number;
    coldPolicy: number;
  };
  intensity: {
    co2Baseline: number;
    co2Policy: number;
    distanceBaseline: number;
    distancePolicy: number;
    co2PerMeterBaseline: number;
    co2PerMeterPolicy: number;
  };
}

// === PEOPLE RESPONSE PAYLOADS ===

// Response categories and counts (SSE: data_text_paragraph1_people_response)
interface PeopleResponseParagraphPayload {
  totalTrips: number;
  affectedTrips: number;
  affectedAgents: number;
  modeShiftCount: number;
  modeShiftPct: number;
  reroutedCount: number;
  reroutedPct: number;
  paidPenaltyCount: number;
  paidPenaltyPct: number;
  cancelledCount: number;
  cancelledPct: number;
  noChangeCount: number;
  noChangePct: number;
  dominantResponse: string;
  penaltyCharges: Array<{ zoneName: string; rate: number }>;
}

// Mode transition matrix (SSE: data_chart_sankey_people_response)
interface PeopleResponseSankeyPayload {
  nodes: string[];
  flows: Array<{ from: string; to: string; count: number }>;
}

// Mode share percentages (SSE: data_chart_bar_people_response)
interface PeopleResponseBarPayload {
  modes: string[];
  baseline: number[];
  policy: number[];
}

// === TRIP PERFORMANCE PAYLOADS ===

// Trip performance paragraph - quadrant analysis (SSE: data_text_paragraph1_trip_legs)
interface TripPerformanceParagraphPayload {
  totalTrips: number;
  changedTrips: number;
  unchangedTrips: number;
  cancelledTrips: number;
  newTrips: number;
  modeShiftTrips: number;
  netCo2DeltaGrams: number;
  netTimeDeltaMinutes: number;
  avgCo2DeltaGrams: number;
  avgTimeDeltaMinutes: number;
  improvedCo2Count: number;
  worsenedCo2Count: number;
  improvedTimeCount: number;
  worsenedTimeCount: number;
  winWinCount: number;
  loseLoseCount: number;
  envWinPersonalCostCount: number;
  personalWinEnvCostCount: number;
  dominantOutcome: string;
}

// Trip performance table data (SSE: data_table_trip_legs)
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
  // Lifecycle events
  | { messageType: 'pa_request_accepted'; payload: StartedPayload; timestamp: string }
  | { messageType: 'pa_simulation_start'; payload: Record<string, never>; timestamp: string }
  | { messageType: 'heartbeat'; payload: Record<string, never>; timestamp: string }
  | { messageType: 'success_process'; payload: Record<string, never>; timestamp: string }
  | { messageType: 'error_global'; payload: ErrorPayload; timestamp: string }
  | { messageType: 'error_validation'; payload: { errors: ValidationError[] }; timestamp: string }
  | { messageType: 'pa_cancelled_process'; payload: { status: string; reason: string }; timestamp: string }

  // Overview data
  | { messageType: 'data_text_overview'; payload: OverviewPayload; timestamp: string }

  // Emissions data
  | { messageType: 'data_text_paragraph1_emissions'; payload: EmissionsParagraph1Payload; timestamp: string }
  | { messageType: 'data_text_paragraph2_emissions'; payload: EmissionsParagraph2Payload; timestamp: string }
  | { messageType: 'data_chart_bar_emissions'; payload: EmissionsParagraph1Payload; timestamp: string }
  | { messageType: 'data_chart_line_emissions'; payload: EmissionsLineChartPayload; timestamp: string }
  | { messageType: 'data_chart_stacked_bar_emissions'; payload: EmissionsStackedBarPayload; timestamp: string }
  | { messageType: 'data_warm_cold_intensity_emissions'; payload: WarmColdIntensityPayload; timestamp: string }

  // People response data
  | { messageType: 'data_text_paragraph1_people_response'; payload: PeopleResponseParagraphPayload; timestamp: string }
  | { messageType: 'data_chart_sankey_people_response'; payload: PeopleResponseSankeyPayload; timestamp: string }
  | { messageType: 'data_chart_bar_people_response'; payload: PeopleResponseBarPayload; timestamp: string }

  // Trip legs data
  | { messageType: 'data_text_paragraph1_trip_legs'; payload: TripPerformanceParagraphPayload; timestamp: string }

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

  // Scenario preamble (load/refetch only)
  | { messageType: 'scenario_status'; payload: { status: string }; timestamp: string }
  | { messageType: 'scenario_input'; payload: Record<string, unknown>; timestamp: string }
  | { messageType: 'scenario_session'; payload: Record<string, unknown>; timestamp: string }

  // Catch-all for unknown message types
  | { messageType: string; payload: Record<string, unknown>; timestamp: string };

// === EXTERNAL API TYPES ===

// Error structure for consumer callbacks
interface SimulationError {
  code: string;
  message: string;
  details?: string;
}

// Backend validation error from error_validation SSE event
export interface ValidationError {
  origin: string;
  error: string;
  message: string;
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
  onValidationError?: (errors: ValidationError[]) => void;
  onTimelineEvent?: (event: string) => void;
  onCancelled?: (reason: string) => void;
  onScenarioStatus?: (status: string) => void;
  onScenarioInput?: (input: Record<string, unknown>) => void;
  onScenarioSession?: (session: Record<string, unknown>) => void;
}
