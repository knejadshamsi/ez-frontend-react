// === SIMULATION LIFE CYCLE EVENTS ===

export const TIMELINE_EVENTS = [
  'started', 'error',
  'validation_started', 'validation_complete',
  'preprocessing_started', 'preprocessing_complete',
  'preprocessing_population_started', 'preprocessing_population_complete',
  'preprocessing_network_started', 'preprocessing_network_complete',
  'preprocessing_transit_started', 'preprocessing_transit_complete',
  'preprocessing_config_started', 'preprocessing_config_complete',
  'simulation_started', 'simulation_complete',
  'simulation_base_started', 'simulation_base_complete',
  'simulation_policy_started', 'simulation_policy_complete',
  'postprocessing_started', 'postprocessing_complete',
  'postprocessing_overview_started', 'postprocessing_overview_complete',
  'postprocessing_emissions_started', 'postprocessing_emissions_complete',
  'postprocessing_people_response_started', 'postprocessing_people_response_complete',
  'postprocessing_trip_legs_started', 'postprocessing_trip_legs_complete',
];
