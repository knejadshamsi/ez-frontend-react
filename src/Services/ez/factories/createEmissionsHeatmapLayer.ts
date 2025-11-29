
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import type { MapPointData } from '~stores/output';

export interface CreateEmissionsHeatmapLayerInput {
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
    // Color gradient from teal to red
    colorRange: [
      [65, 182, 196],   // Light teal
      [127, 205, 187],  // Teal-green
      [199, 233, 180],  // Light green
      [237, 248, 177],  // Yellow-green
      [255, 237, 160],  // Light yellow
      [254, 217, 118],  // Yellow
      [254, 178, 76],   // Orange
      [253, 141, 60],   // Dark orange
      [252, 78, 42],    // Red-orange
      [227, 26, 28],    // Red
    ],
    pickable: false,
  });
};
