import axios from 'axios';
import { useAPIPayloadStore } from '~store';
import { useEZSessionStore } from '~stores/session';
import { getBackendUrl } from './config';
import type { MainInputPayload, ScenarioMetadata } from '~ez/stores/types';
import { ApiResponse, unwrapResponse } from './apiResponse';

export async function fetchScenarioMainInput(requestId: string): Promise<MainInputPayload> {
  const backendUrl = getBackendUrl();
  const response = await axios.get<ApiResponse<MainInputPayload>>(
    `${backendUrl}/scenario/${requestId}/input/main`,
    { timeout: 10000 }
  );
  return unwrapResponse(response);
}

export function restoreStoresFromInput(
  mainInput: MainInputPayload,
  metadata: ScenarioMetadata | null
): void {
  try {

    const apiPayloadStore = useAPIPayloadStore.getState();
    const sessionStore = useEZSessionStore.getState();

    // Restore session metadata
    sessionStore.setScenarioTitle(mainInput.scenarioTitle);
    sessionStore.setScenarioDescription(mainInput.scenarioDescription);

    // Restore UI metadata if available
    if (metadata) {
      // Restore zone session data
      Object.entries(metadata.zoneSessionData).forEach(([zoneId, zoneData]) => {
        sessionStore.setZoneData(zoneId, zoneData);
      });

      // Restore display config
      sessionStore.setSimulationAreaDisplay(metadata.simulationAreaDisplay);

      // Restore car distribution categories
      Object.entries(metadata.carDistributionCategories).forEach(([category, enabled]) => {
        if (!enabled) {
          sessionStore.toggleCarDistributionCategory(category);
        }
      });

      // Restore active selections
      if (metadata.activeZone) {
        sessionStore.setActiveZone(metadata.activeZone);
      }
      if (metadata.activeCustomArea) {
        sessionStore.setActiveCustomArea(metadata.activeCustomArea);
      }
    }

    // Restore API payload (simulation data)
    apiPayloadStore.setZones(mainInput.zones);
    apiPayloadStore.setSources(mainInput.sources);
    apiPayloadStore.setSimulationOptions(mainInput.simulationOptions);
    apiPayloadStore.setCarDistribution(mainInput.carDistribution);
    apiPayloadStore.setModeUtilities(mainInput.modeUtilities);

    // Restore custom simulation areas with ID preservation
    if (mainInput.customSimulationAreas.length > 0) {
      // Use bulk setter to preserve IDs
      apiPayloadStore.setCustomSimulationAreas(
        mainInput.customSimulationAreas.map(area => ({
          id: area.id,
          coords: area.coords
        }))
      );

      // Restore session data from metadata
      if (metadata) {
        mainInput.customSimulationAreas.forEach(area => {
          if (metadata.customAreaSessionData?.[area.id]) {
            sessionStore.setCustomAreaData(area.id, metadata.customAreaSessionData[area.id]);
          }
        });
      }
    }

    // Restore scaled simulation areas with ID preservation
    if (mainInput.scaledSimulationAreas.length > 0) {
      // Use bulk setter to preserve IDs
      apiPayloadStore.setScaledSimulationAreas(
        mainInput.scaledSimulationAreas.map(area => ({
          id: area.id,
          zoneId: area.zoneId,
          coords: area.coords
        }))
      );

      // Restore session data from metadata
      if (metadata) {
        mainInput.scaledSimulationAreas.forEach(area => {
          if (metadata.scaledAreaSessionData?.[area.id]) {
            sessionStore.setScaledAreaData(area.id, metadata.scaledAreaSessionData[area.id]);
          }
        });
      }
    }

    console.log('[Input Data] Successfully restored input parameters and metadata');
  } catch (error) {
    console.error('[Input Data] Failed to restore input data:', error);
    throw error;
  }
}
