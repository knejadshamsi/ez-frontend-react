
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import type { MapPointData } from '~stores/output';
import { EMISSIONS_COLOR_GRADIENT } from './constants';

interface CreateEmissionsHeatmapLayerInput {
  data: MapPointData[]; // Array of emission points with position and weight
  idSuffix?: string; // Optional layer ID suffix
}

// Create a heatmap layer for emissions visualization
export const createEmissionsHeatmapLayer = ({
  data,
  idSuffix = '',
}: CreateEmissionsHeatmapLayerInput) => {
  return new HeatmapLayer<MapPointData>({
    id: `ez-emissions-heatmap${idSuffix}`,
    data,
    getPosition: (d) => d.position,
    getWeight: (d) => d.weight,
    aggregation: 'SUM',
    radiusPixels: 30,
    intensity: 1,
    threshold: 0.05,
    colorRange: [
      ...EMISSIONS_COLOR_GRADIENT.slice(0, 4),
      [255, 237, 160],
      ...EMISSIONS_COLOR_GRADIENT.slice(4, 7),
      [252, 78, 42],
      EMISSIONS_COLOR_GRADIENT[7],
    ],
    pickable: false,
  });
};
