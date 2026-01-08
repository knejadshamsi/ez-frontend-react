import type { EmissionsMapData, PeopleResponseMapData, MapPointData } from '~stores/output/types';

/**
 * Selects emissions map points for the specified pollutant
 */
export const selectEmissionsMapPoints = (
  data: EmissionsMapData | null,
  pollutant: keyof EmissionsMapData
): MapPointData[] => {
  if (!data) return [];
  return data[pollutant] || [];
};

/**
 * Selects people response map points for the specified view and response type
 */
export const selectPeopleResponseMapPoints = (
  data: PeopleResponseMapData | null,
  view: 'origin' | 'destination',
  responseType: string
): MapPointData[] => {
  if (!data) return [];
  const viewData = data[view];
  if (!viewData) return [];
  return (viewData as Record<string, MapPointData[]>)[responseType] || [];
};
