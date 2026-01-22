/**
 * EZ API Module Exports
 *
 * File structure per SSE_ARCHITECTURE.md:
 * - healthCheck.ts      - Check backend alive → set isEzBackendAlive
 * - sse/                - SSE streaming module (types, handlers, stream lifecycle)
 * - startSimulation.ts  - Orchestrates demo/real simulation flow
 * - mapDataFetch.ts     - REST fetch for map visualization data
 * - tripLegsFetch.ts    - REST fetch for paginated trip legs (pages 2+)
 */

export { checkBackendHealth } from './healthCheck';
export {
  startSimulationStream,
  type SSEMessage,
  type SimulationError,
  type SimulationStreamConfig,
} from './sse';
export { cancelSimulation } from './cancelSimulation';
export { startSimulation, loadScenario } from './startSimulation';
export {
  fetchMapData,
  fetchEmissionsMapData,
  fetchPeopleResponseMapData,
  fetchTripLegsMapData,
} from './mapDataFetch';
export { fetchTripLegsPage } from './tripLegsFetch';
export { getBackendUrl, isBackendConfigured } from './config';
export {
  createAPIRequest,
  validateAPIRequest,
  type APIRequest,
} from './apiRequestFactory';
export { retryComponentData } from './retryComponent';
export { fetchScenarioMetadata } from './fetchScenarioMetadata';
export { updateScenarioMetadata, createMetadataPayload } from './updateScenarioMetadata';
export { deleteScenario } from './deleteScenario';
export { fetchScenarioMainInput, restoreStoresFromInput } from './fetchScenarioInput';
