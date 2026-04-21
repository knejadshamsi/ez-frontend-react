// === OVERVIEW TYPES ===

// Overview section - simulation summary statistics (SSE: data_overview)
export interface EZOutputOverviewData {
  personCount: number;
  legCount: number;
  totalAreaCoverageKm2: number;
  totalNetworkNodes: number;
  totalNetworkLinks: number;
  totalKmTraveled: number;
  samplePersonCount: number;
  sampleLegCount: number;
  sampleTotalKmTraveled: number;
  samplePercentage: number;
}

// === EMISSIONS TYPES ===

// Emissions Paragraph 1 - pollutant totals and deltas (SSE: data_text_paragraph1_emissions)
// Also used for bar chart (SSE: data_chart_bar_emissions) which sends identical payload
export interface EZEmissionsParagraph1Data {
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

// Emissions Paragraph 2 - PM2.5 spatial density (SSE: data_text_paragraph2_emissions)
export interface EZEmissionsParagraph2Data {
  pm25PerKm2Baseline: number;
  pm25PerKm2Policy: number;
  zoneAreaKm2: number;
  mixingHeightMeters: number;
}

// Emissions Bar Chart - same shape as paragraph 1 (SSE: data_chart_bar_emissions)
export type EZEmissionsBarChartData = EZEmissionsParagraph1Data;

// Emissions Line Chart - time-binned pollutant data (SSE: data_chart_line_emissions)
export interface EZEmissionsLineChartData {
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

// Emissions Stacked Bar - by vehicle type (SSE: data_chart_stacked_bar_emissions)
export interface EZEmissionsStackedBarData {
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

// Emissions Warm/Cold split + CO2 intensity (SSE: data_warm_cold_intensity_emissions)
export interface EZEmissionsWarmColdIntensityData {
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

// === PEOPLE RESPONSE TYPES ===

// People Response Paragraph - response categories (SSE: data_text_paragraph1_people_response)
export interface EZPeopleResponseParagraphData {
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

// People Response Sankey - mode transition matrix (SSE: data_chart_sankey_people_response)
export interface EZPeopleResponseSankeyData {
  nodes: string[];
  flows: Array<{ from: string; to: string; count: number }>;
}

// === TRIP PERFORMANCE TYPES ===

// Trip Performance Paragraph - quadrant analysis (SSE: data_text_paragraph1_trip_legs)
export interface EZTripLegsParagraphData {
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

// Single trip performance record (SSE: data_table_trip_legs, REST: GET /scenario/{requestId}/trip-legs)
export interface EZTripLegRecord {
  legId: string;
  personId: string;
  originActivity: string;
  destinationActivity: string;
  co2DeltaGrams: number;
  timeDeltaMinutes: number;
  impact: string;
}

// Pagination info from REST API response
export interface EZTripLegsPaginationInfo {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalAllRecords: number;
  totalPages: number;
}

// === MAP VISUALIZATION TYPES ===

// Point data for heatmap/hexagon visualization
export interface MapPointData {
  position: [number, number]; // [longitude, latitude]
  weight: number; // Weight/intensity value for aggregation
}

// Arc data for trip leg visualization (one arc per leg)
export interface TripLegArc {
  from: [number, number]; // [longitude, latitude]
  to: [number, number];   // [longitude, latitude]
  mode: string;           // car, bus, subway, walk, bike, pt
}

// Trip legs map data keyed by trip ID
export interface TripLegsMapData {
  [tripId: string]: {
    baseline?: TripLegArc[];
    policy?: TripLegArc[];
  };
}

// Pollutant map data with heatmap points
interface PollutantMapData {
  CO2: MapPointData[];
  NOx: MapPointData[];
  'PM2.5': MapPointData[];
  PM10: MapPointData[];
}

// Emissions map data organized by scenario and pollutant type
export interface EmissionsMapData {
  baseline: PollutantMapData;
  policy: PollutantMapData;
  privateBaseline: PollutantMapData;
  privatePolicy: PollutantMapData;
}

// Response category map data with scatter points
interface ResponseCategoryMapData {
  modeShift: MapPointData[];
  rerouted: MapPointData[];
  paidPenalty: MapPointData[];
  cancelled: MapPointData[];
}

// People response map data organized by view and response category
export interface PeopleResponseMapData {
  origin: ResponseCategoryMapData;
  destination: ResponseCategoryMapData;
}

// === OUTPUT COMPONENT STATE MACHINE ===
export type OutputComponentState =
  | 'inactive'
  | 'error_initial'
  | 'success_initial'
  | 'loading'
  | 'error'
  | 'success';

// === MAP STORE ===

// Data-only slice of the map store (no actions) - used to type initial state factories
export interface EZOutputMapStoreData {
  emissionsMapState: OutputComponentState;
  emissionsMapData: EmissionsMapData | null;
  emissionsMapError: string | null;

  peopleResponseMapState: OutputComponentState;
  peopleResponseMapData: PeopleResponseMapData | null;
  peopleResponseMapError: string | null;

  tripLegsMapState: OutputComponentState;
  tripLegsMapData: TripLegsMapData | null;
  tripLegsMapError: string | null;
}

// Full map store interface: state fields + actions
export interface EZOutputMapStoreState extends EZOutputMapStoreData {
  setEmissionsMapState: (state: OutputComponentState) => void;
  setEmissionsMapData: (data: EmissionsMapData) => void;
  setEmissionsMapError: (error: string | null) => void;

  setPeopleResponseMapState: (state: OutputComponentState) => void;
  setPeopleResponseMapData: (data: PeopleResponseMapData) => void;
  setPeopleResponseMapError: (error: string | null) => void;

  setTripLegsMapState: (state: OutputComponentState) => void;
  setTripLegsMapData: (data: TripLegsMapData) => void;
  setTripLegsMapError: (error: string | null) => void;

  resetMapStore: () => void;
}
