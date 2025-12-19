import { useAPIPayloadStore } from '~store';
import { useEZSessionStore } from '~stores/session';
import { getBackendUrl } from './config';
import type { FullInputPayload } from '~ez/stores/types';

export async function fetchScenarioInput(requestId: string): Promise<void> {
  const backendUrl = getBackendUrl();

  try {
    const response = await fetch(`${backendUrl}/api/ez/scenario/${requestId}/input`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const inputData: FullInputPayload = await response.json();

    const apiPayloadStore = useAPIPayloadStore.getState();
    const sessionStore = useEZSessionStore.getState();

    // session
    if (inputData.scenarioTitle) {
      sessionStore.setScenarioTitle(inputData.scenarioTitle);
    }
    if (inputData.scenarioDescription) {
      sessionStore.setScenarioDescription(inputData.scenarioDescription);
    }

    // zone session
    if (inputData.zoneSessionData) {
      Object.entries(inputData.zoneSessionData).forEach(([zoneId, zoneData]) => {
        sessionStore.setZoneData(zoneId, zoneData);
      });
    }

    // simulation area display config
    sessionStore.setSimulationAreaDisplay(inputData.simulationAreaDisplay);

    // API payload
    if (inputData.zones) apiPayloadStore.setZones(inputData.zones);
    if (inputData.sources) apiPayloadStore.setSources(inputData.sources);
    if (inputData.simulationOptions) apiPayloadStore.setSimulationOptions(inputData.simulationOptions);
    if (inputData.carDistribution) apiPayloadStore.setCarDistribution(inputData.carDistribution);
    if (inputData.modeUtilities) apiPayloadStore.setModeUtilities(inputData.modeUtilities);

    // custom simulation
    if (inputData.customSimulationAreas && inputData.customSimulationAreas.length > 0) {
      inputData.customSimulationAreas.forEach(area => {
        if (area.coords && area.coords.length > 0) {
          const id = apiPayloadStore.addCustomSimulationArea(area.color);
          apiPayloadStore.updateCustomSimulationArea(id, { name: area.name, coords: area.coords });
        }
      });
    }

    // scaled simulation areas
    if (inputData.scaledSimulationAreas && inputData.scaledSimulationAreas.length > 0) {
      inputData.scaledSimulationAreas.forEach(area => {
        apiPayloadStore.upsertScaledSimulationArea(
          area.zoneId,
          area.coords,
          area.scale,
          area.color
        );
      });
    }

    console.log('[Input Data] Successfully fetched and restored input parameters');
  } catch (error) {
    console.error('[Input Data] Failed to fetch input data:', error);
    throw error;
  }
}
