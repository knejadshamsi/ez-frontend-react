import { v4 as uuidv4 } from 'uuid';
import type { APIPayload } from './types';

// ============= CONSTANTS =============
const DEFAULT_SIMULATION_ITERATIONS = 5;
const DEFAULT_SIMULATION_PERCENTAGE = 5;
const DEFAULT_CAR_DISTRIBUTION = {
  zeroEmission: 30,
  nearZeroEmission: 35,
  lowEmission: 35,
  midEmission: 0,
  highEmission: 0
};

// ============= INITIAL PAYLOAD =============
// Created once at module load - single source of truth for defaults
export const INITIAL_PAYLOAD: APIPayload = {
  zones: [{
    id: uuidv4(),
    coords: null,
    trip: ['start'],
    policies: []
  }],
  customSimulationAreas: [],
  scaledSimulationAreas: [],
  sources: {
    population: {
      year: 2025,
      name: 'montreal-polytechnique-pipeline-2025'
    },
    network: {
      year: 2025,
      name: 'osm-2025'
    },
    publicTransport: {
      year: 2025,
      name: 'stm-gtfs-2025'
    }
  },
  simulationOptions: {
    iterations: DEFAULT_SIMULATION_ITERATIONS,
    percentage: DEFAULT_SIMULATION_PERCENTAGE
  },
  carDistribution: { ...DEFAULT_CAR_DISTRIBUTION },
  modeUtilities: {
    walk: 0,
    bike: 0,
    car: 0,
    ev: 0,
    subway: 0,
    bus: 0
  }
};

export const DEFAULT_ZONE_ID = INITIAL_PAYLOAD.zones[0].id;
