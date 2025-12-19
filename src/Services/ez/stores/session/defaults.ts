import type { ZoneSessionData, VisualizationType, PollutantType, ResponseLayerView, BehavioralResponseType, SimulationAreaDisplayConfig } from './types';

// === SESSION DEFAULTS ===

export const DEFAULT_SCENARIO_TITLE = 'New Scenario';
export const DEFAULT_SCENARIO_DESCRIPTION = '';
export const DEFAULT_REQUEST_ID = '';

export const DEFAULT_SIMULATION_AREA_DISPLAY: SimulationAreaDisplayConfig = {
  borderStyle: 'dashed',
  fillOpacity: 0
};

export const COLOR_PALETTE = [
  '#1A16E2',
  '#003366',
  '#5F0F40',
  '#7209B7',
  '#FA3E9A',
  '#FF6B6B',
  '#FF2800',
  '#FF7E00'
];

export const DEFAULT_ZONE_SESSION_DATA: ZoneSessionData = {
  name: 'New Zone 1',
  color: COLOR_PALETTE[0],
  hidden: false,
  scale: [100, 'center']
};

// === FILTER DEFAULTS ===

export const DEFAULT_VISUALIZATION_TYPE: VisualizationType = 'heatmap';
export const DEFAULT_POLLUTANT_TYPE: PollutantType = 'CO2';
export const DEFAULT_RESPONSE_VIEW: ResponseLayerView = 'origin';
export const DEFAULT_BEHAVIORAL_RESPONSE: BehavioralResponseType = 'paidPenalty';
