import { useAPIPayloadStore } from '~store';
import { useEZSessionStore } from '~stores/session';
import { COLOR_PALETTE } from '~stores/session/defaults';
import type { MainInputPayload, ScenarioMetadata } from '~ez/stores/types';

function validateInputData(input: MainInputPayload): void {
  if (!input.sources) throw new Error('Missing sources data');
  for (const key of ['population', 'network', 'publicTransport'] as const) {
    const source = input.sources[key];
    if (!source || typeof source.year !== 'number' || typeof source.name !== 'string') {
      throw new Error(`Invalid or missing source: ${key}`);
    }
  }
  if (!Array.isArray(input.zones)) throw new Error('Missing zones data');
  if (!input.simulationOptions) throw new Error('Missing simulation options');
  if (!input.carDistribution) throw new Error('Missing car distribution');
  if (!input.modeUtilities) throw new Error('Missing mode utilities');
}

export function restoreStoresFromInput(
  mainInput: MainInputPayload,
  metadata: ScenarioMetadata | null
): void {
  try {
    validateInputData(mainInput);

    const apiPayloadStore = useAPIPayloadStore.getState();
    const sessionStore = useEZSessionStore.getState();

    // Restore session metadata (may be absent if sent via separate metadata endpoint)
    if (mainInput.scenarioTitle) {
      sessionStore.setScenarioTitle(mainInput.scenarioTitle);
    }
    if (mainInput.scenarioDescription) {
      sessionStore.setScenarioDescription(mainInput.scenarioDescription);
    }

    // Restore UI metadata if available
    if (metadata) {
      // Restore zone session data
      if (metadata.zoneSessionData) {
        Object.entries(metadata.zoneSessionData).forEach(([zoneId, zoneData]) => {
          sessionStore.setZoneData(zoneId, zoneData);
        });
      }

      // Restore display config
      if (metadata.simulationAreaDisplay) {
        sessionStore.setSimulationAreaDisplay(metadata.simulationAreaDisplay);
      }

      // Restore car distribution categories (direct set - toggle breaks when defaults differ from backend)
      if (metadata.carDistributionCategories) {
        sessionStore.setCarDistributionCategories(metadata.carDistributionCategories);
      }

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

    // Ensure every zone has session data (fallback for missing metadata)
    mainInput.zones.forEach((zone, index) => {
      if (!sessionStore.zones[zone.id]) {
        sessionStore.setZoneData(zone.id, {
          name: `Zone ${index + 1}`,
          color: COLOR_PALETTE[index % COLOR_PALETTE.length],
          hidden: false,
          scale: [100, 'center'],
        });
      }
    });
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

  } catch (error) {
    console.error('[Input Data] Failed to restore input data:', error);
    throw error;
  }
}
