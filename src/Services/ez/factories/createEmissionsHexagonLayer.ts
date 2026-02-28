
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import type { MapPointData } from '~stores/output';
import { EMISSIONS_COLOR_GRADIENT } from './constants';

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
    colorRange: EMISSIONS_COLOR_GRADIENT,
    colorAggregation: 'SUM',
    pickable: true,
  });
};
