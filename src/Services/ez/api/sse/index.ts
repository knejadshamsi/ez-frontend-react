// === SSE STREAMING API ===

/* Main stream management functions */
export { startSimulationStream, cancelSimulation } from './stream';

/* Public type definitions for consumers */
export type { SSEMessage, SimulationError, SimulationStreamConfig } from './types';
