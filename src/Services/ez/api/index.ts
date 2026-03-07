/**
 * EZ API Module Exports
 *
 * File structure per SSE_ARCHITECTURE.md:
 * - healthCheck.ts      - Check backend alive -> set isEzBackendAlive
 * - sse/                - SSE streaming module (types, handlers, stream lifecycle)
 * - startSimulation.ts  - Orchestrates demo/real simulation flow
 * - mapDataFetch.ts     - REST fetch for map visualization data
 * - tripLegsFetch.ts    - REST fetch for paginated trip legs (pages 2+)
 */

export { checkBackendHealth } from './healthCheck';
export { cancelSimulation } from './cancelSimulation';
export { startSimulation, loadScenario } from './startSimulation';
export { fetchMapData } from './mapDataFetch';
export { fetchTripLegsPage } from './tripLegsFetch';
export { getBackendUrl } from './config';
export {
  createAPIRequest,
  validateAPIRequest,
  type APIRequest,
} from './apiRequestFactory';
export { retryComponentData } from './retryComponent';
export { updateScenarioMetadata, createMetadataPayload } from './updateScenarioMetadata';
export { deleteScenario } from './deleteScenario';
export { restoreStoresFromInput } from './fetchScenarioInput';
