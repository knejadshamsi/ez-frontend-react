
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import type { MapPointData } from '~stores/output';

export interface CreateEmissionsHexagonLayerInput {
  data: MapPointData[]; // Array of emission points with position and weight
  idSuffix?: string; // Optional layer ID suffix
}

// Create a hexagon layer for emissions visualization
export const createEmissionsHexagonLayer = ({
  data,
  idSuffix = '',
}: CreateEmissionsHexagonLayerInput) => {
  return new HexagonLayer<MapPointData>({
    id: `ez-emissions-hexagon${idSuffix}`,
    data,
    getPosition: (d) => d.position,
    getColorWeight: (d) => d.weight,
    extruded: false,
    radius: 100,
    coverage: 0.9,
    upperPercentile: 100,
    // Color gradient from teal to red
    colorRange: [
      [65, 182, 196],   // Light teal
      [127, 205, 187],  // Teal-green
      [199, 233, 180],  // Light green
      [237, 248, 177],  // Yellow-green
      [254, 217, 118],  // Yellow
      [254, 178, 76],   // Orange
      [253, 141, 60],   // Dark orange
      [227, 26, 28],    // Red
    ],
    colorAggregation: 'SUM',
    pickable: true,
  });
};
