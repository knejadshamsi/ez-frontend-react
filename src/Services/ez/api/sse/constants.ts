// === SIMULATION PHASE EVENTS ===
//
// Phase events follow the pattern:
// - pa_{step}_started (step in progress)
// - pa_{step}_complete (step completed)
// - pa_{step}_failed (step failed)
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
