import axios from 'axios';
import { getBackendUrl } from './config';
import { ScenarioMetadata } from '~stores/types';
import { useEZSessionStore } from '~stores/session';
import { ApiResponse } from './apiResponse';

export const createMetadataPayload = (): ScenarioMetadata => {
  const sessionStore = useEZSessionStore.getState();

  return {
    zoneSessionData: sessionStore.zones,
    customAreaSessionData: sessionStore.customAreas,
    scaledAreaSessionData: sessionStore.scaledAreas,
    simulationAreaDisplay: sessionStore.simulationAreaDisplay,
    carDistributionCategories: sessionStore.carDistributionCategories,
    activeZone: sessionStore.activeZone,
    activeCustomArea: sessionStore.activeCustomArea,
    colorPalette: sessionStore.colorPalette
  };
};

export const updateScenarioMetadata = async (
  requestId: string,
  metadata?: ScenarioMetadata
): Promise<void> => {
  const backendUrl = getBackendUrl();
  const url = `${backendUrl}/scenario/${requestId}/input/metadata`;

  const payload = metadata || createMetadataPayload();

  const response = await axios.post<ApiResponse<void>>(url, payload, {
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (response.data.statusCode !== 200) {
    throw new Error(`Failed to update metadata: ${response.data.message}`);
  }
};
