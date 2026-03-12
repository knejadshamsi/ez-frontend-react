import type { EmissionsMapData, PeopleResponseMapData, MapPointData } from '~stores/output/types';

type PollutantKey = 'CO2' | 'NOx' | 'PM2.5' | 'PM10' | 'All';
type ScenarioKey = 'baseline' | 'policy';
type EmissionsViewMode = 'private' | 'all';
type ResponseCategory = 'modeShift' | 'rerouted' | 'paidPenalty' | 'cancelled';

/**
 * Selects emissions map points for the specified pollutant, scenario, and view mode
 */
export const selectEmissionsMapPoints = (
  data: EmissionsMapData | null,
  pollutant: PollutantKey,
  scenario: ScenarioKey = 'baseline',
  viewMode: EmissionsViewMode = 'private'
): MapPointData[] => {
  if (!data) return [];

  let scenarioData;
  if (viewMode === 'private') {
    scenarioData = scenario === 'baseline' ? data.privateBaseline : data.privatePolicy;
  } else {
    scenarioData = data[scenario];
  }

  if (!scenarioData) return [];

  if (pollutant === 'All') {
    const allKeys = ['CO2', 'NOx', 'PM2.5', 'PM10'] as const;
    const positionMap = new Map<string, number>();
    const merged: MapPointData[] = [];

    for (const key of allKeys) {
      const points = scenarioData[key] || [];
      const conversionFactor = key === 'CO2' ? 1 : 0.001;
      for (const pt of points) {
        const posKey = `${pt.position[0]},${pt.position[1]}`;
        const idx = positionMap.get(posKey);
        if (idx !== undefined) {
          merged[idx] = {
            position: merged[idx].position,
            weight: merged[idx].weight + pt.weight * conversionFactor,
          };
        } else {
          positionMap.set(posKey, merged.length);
          merged.push({ position: pt.position, weight: pt.weight * conversionFactor });
        }
      }
    }
    return merged;
  }

  return scenarioData[pollutant] || [];
};

/**
 * Selects people response map points for the specified view and response category
 */
export const selectPeopleResponseMapPoints = (
  data: PeopleResponseMapData | null,
  view: 'origin' | 'destination',
  category: ResponseCategory
): MapPointData[] => {
  if (!data) return [];
  const viewData = data[view];
  if (!viewData) return [];
  return viewData[category] || [];
};

