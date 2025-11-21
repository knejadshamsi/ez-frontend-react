import type { EmissionsMapData, PeopleResponseMapData, MapPointData } from './types';

// === MAP DATA UTILITIES ===

/* Get emissions points for the currently selected pollutant */
export const getEmissionsPointsForPollutant = (
  data: EmissionsMapData | null,
  pollutant: keyof EmissionsMapData
): MapPointData[] => {
  if (!data) return [];
  return data[pollutant] || [];
};

/* Get people response points for current view and response type */
export const getPeopleResponsePoints = (
  data: PeopleResponseMapData | null,
  view: 'origin' | 'destination',
  responseType: string
): MapPointData[] => {
  if (!data) return [];
  const viewData = data[view];
  if (!viewData) return [];
  return (viewData as Record<string, MapPointData[]>)[responseType] || [];
};
