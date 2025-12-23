// === SIMULATION PHASE EVENTS ===
//
// Phase events follow the pattern:
// - pa_phase_* (phase started)
// - success_phase_* (phase completed successfully)
// - error_phase_* (phase failed)
//
// These are detected by prefix checking in handlers, no explicit array needed.
//
// Phase hierarchy for documentation:
//
// 1. Validation
//    - validation
//
// 2. Preprocessing
//    - preprocessing (parent)
//    - preprocessing_population
//    - preprocessing_network
//    - preprocessing_transit
//    - preprocessing_config
//
// 3. Simulation
//    - simulation (parent)
//    - simulation_base
//    - simulation_policy
//
// 4. Postprocessing
//    - postprocessing (parent)
//    - postprocessing_overview
//    - postprocessing_emissions
//    - postprocessing_people_response
//    - postprocessing_trip_legs
