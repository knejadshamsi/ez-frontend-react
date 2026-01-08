// === OVERVIEW TYPES ===

// Overview section - simulation summary statistics (SSE: data_overview)
export interface EZOutputOverviewData {
  totalPersonCount: number;
  totalLegCount: number;
  totalAreaCoverageKm2: number;
  totalNetworkNodes: number;
  totalNetworkLinks: number;
  totalKilometersTraveled: number;
}

// === EMISSIONS TYPES ===

// Emissions Paragraph 1 - pollutant comparison (SSE: data_emissions_paragraph1)
export interface EZEmissionsParagraph1Data {
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

// Emissions Paragraph 2 - air quality and vehicle fleet (SSE: data_emissions_paragraph2)
export interface EZEmissionsParagraph2Data {
  pm25PostPolicy: number;
  zoneAreaKm2: number;
  mixingHeightMeters: number;
  electricVehicleShareBaseline: number;
  electricVehicleSharePostPolicy: number;
  standardVehicleShareBaseline: number;
  standardVehicleSharePostPolicy: number;
  heavyVehicleShareBaseline: number;
  heavyVehicleSharePostPolicy: number;
}

// Emissions Bar Chart - pollutant arrays (SSE: data_emissions_bar_chart) [CO2, NOx, PM2.5, PM10]
export interface EZEmissionsBarChartData {
  baselineEmissions: number[];
  postPolicyEmissions: number[];
}

// Emissions Pie Charts - vehicle type contributions (SSE: data_emissions_pie_charts) [Electric, Standard, Heavy]
export interface EZEmissionsPieChartsData {
  vehicleShareBaseline: number[];
  vehicleSharePostPolicy: number[];
}

// === PEOPLE RESPONSE TYPES ===

// People Response Paragraph 1 - behavioral breakdown percentages (SSE: data_people_response_paragraph1)
export interface EZPeopleResponseParagraph1Data {
  paidPenaltyPercentage: number;
  reroutedPercentage: number;
  switchedToBusPercentage: number;
  switchedToSubwayPercentage: number;
  switchedToWalkingPercentage: number;
  switchedToBikingPercentage: number;
  cancelledTripPercentage: number;
  penaltyChargeAmount: number;
  totalAffectedTrips: number;
}

// People Response Paragraph 2 - time impacts per response type (SSE: data_people_response_paragraph2)
export interface EZPeopleResponseParagraph2Data {
  averageTimePaidPenalty: number;
  averageTimeRerouted: number;
  averageTimeSwitchedToBus: number;
  averageTimeSwitchedToSubway: number;
  averageTimeSwitchedToWalking: number;
  averageTimeSwitchedToBiking: number;
}

// People Response Breakdown Chart - stacked bar percentages (SSE: data_people_response_breakdown)
export interface EZPeopleResponseBreakdownChartData {
  responsePercentages: number[];
}

// People Response Time Impact Chart - time deltas per response (SSE: data_people_response_time_impact)
export interface EZPeopleResponseTimeImpactChartData {
  averageTimeDeltas: number[];
}

// === TRIP LEGS TYPES ===

// Single trip leg performance record (REST: GET /api/simulation/{requestId}/trip-legs)
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
  totalPages: number;
}

// === CHART CONFIGURATION TYPES ===

export interface EZPeopleResponseChartConfig {
  categoryIds: string[];
  categoryLabels: string[];
  categoryColors: string[];
}

export interface EZTimeImpactChartConfig {
  categoryIds: string[];
  categoryLabels: string[];
  categoryColors: string[];
}

export interface EZEmissionsBarChartConfig {
  pollutantIds: string[];
  pollutantLabels: string[];
  baselineBarColor: string;
  postPolicyBarColor: string;
}

export interface EZVehicleEmissionsChartConfig {
  vehicleTypeIds: string[];
  vehicleTypeLabels: string[];
  vehicleTypeColors: string[];
}

export interface EZTripLegsTableConfig {
  columns: {
    title: string;
    dataIndex: string;
    key: string;
    width: number;
    isSortable?: boolean;
  }[];
}

// === MAP VISUALIZATION TYPES ===

// Point data for heatmap/hexagon visualization
export interface MapPointData {
  position: [number, number]; // [longitude, latitude]
  weight: number; // Weight/intensity value for aggregation
}

// Path data for trip leg visualization
export interface MapPathData {
  id: string;
  path: [number, number][]; // Array of [longitude, latitude] coordinates
  co2Delta: number; // CO2 delta for coloring (negative = reduction)
  timeDelta: number; // Time delta in minutes
  impact: string;
}

// Emissions map data organized by pollutant type
export interface EmissionsMapData {
  CO2: MapPointData[];
  NOx: MapPointData[];
  'PM2.5': MapPointData[];
  PM10: MapPointData[];
}

// People response map data organized by response type and view
export interface PeopleResponseMapData {
  origin: {
    paidPenalty: MapPointData[];
    rerouted: MapPointData[];
    switchedToBus: MapPointData[];
    switchedToSubway: MapPointData[];
    switchedToWalking: MapPointData[];
    switchedToBiking: MapPointData[];
    cancelledTrip: MapPointData[];
  };
  destination: {
    paidPenalty: MapPointData[];
    rerouted: MapPointData[];
    switchedToBus: MapPointData[];
    switchedToSubway: MapPointData[];
    switchedToWalking: MapPointData[];
    switchedToBiking: MapPointData[];
    cancelledTrip: MapPointData[];
  };
}

// === OUTPUT COMPONENT STATE MACHINE ===
export type OutputComponentState =
  | 'inactive'     
  | 'error_initial'
  | 'success_initial'
  | 'loading'
  | 'error'
  | 'success';
