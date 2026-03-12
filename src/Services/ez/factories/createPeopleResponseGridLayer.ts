
import { ScreenGridLayer } from '@deck.gl/aggregation-layers';
import type { MapPointData } from '~stores/output';

const DEFAULT_GRID_COLOR: [number, number, number] = [255, 140, 0];

interface CreatePeopleResponseGridLayerInput {
  data: MapPointData[]; // Array of response points with position and weight
  color?: [number, number, number]; // Color for the grid cells
  idSuffix?: string; // Optional layer ID suffix
}

// Color mapping for response categories
const RESPONSE_TYPE_COLORS: Record<string, [number, number, number]> = {
  modeShift: [64, 150, 255],       // Blue
  rerouted: [250, 140, 22],        // Orange
  paidPenalty: [250, 219, 20],      // Yellow
  cancelled: [255, 77, 79],         // Red
};

// Create a screen grid layer for people response visualization
const createPeopleResponseGridLayer = ({
  data,
  color = DEFAULT_GRID_COLOR,
  idSuffix = '',
}: CreatePeopleResponseGridLayerInput) => {
  return new ScreenGridLayer<MapPointData>({
    id: `ez-people-response-grid${idSuffix}`,
    data,
    getPosition: (d) => d.position,
    getWeight: (d) => d.weight,
    cellSizePixels: 20,
    colorRange: [
      [color[0], color[1], color[2], 25],
      [color[0], color[1], color[2], 85],
      [color[0], color[1], color[2], 127],
      [color[0], color[1], color[2], 170],
      [color[0], color[1], color[2], 212],
      [color[0], color[1], color[2], 255],
    ],
    aggregation: 'SUM',
    pickable: false,
  });
};

// Create a people response grid layer with response type color
export const createPeopleResponseGridLayerForType = (
  data: MapPointData[],
  responseType: string
) => {
  const color = RESPONSE_TYPE_COLORS[responseType] || DEFAULT_GRID_COLOR;
  return createPeopleResponseGridLayer({
    data,
    color,
    idSuffix: `-${responseType}`,
  });
};
