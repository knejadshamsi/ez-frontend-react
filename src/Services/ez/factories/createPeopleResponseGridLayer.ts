
import { ScreenGridLayer } from '@deck.gl/aggregation-layers';
import type { MapPointData } from '~stores/output';

export interface CreatePeopleResponseGridLayerInput {
  data: MapPointData[]; // Array of response points with position and weight
  color?: [number, number, number]; // Color for the grid cells
  idSuffix?: string; // Optional layer ID suffix
}

// Color mapping for different response types
export const RESPONSE_TYPE_COLORS: Record<string, [number, number, number]> = {
  paidPenalty: [201, 201, 201],      // Gray
  rerouted: [255, 212, 163],          // Light orange
  switchedToBus: [184, 212, 232],   // Light blue
  switchedToSubway: [168, 199, 221], // Blue
  switchedToWalking: [200, 230, 201], // Light green
  switchedToBiking: [178, 223, 178], // Green
  cancelledTrip: [245, 183, 177],    // Light red
};

// Create a screen grid layer for people response visualization
export const createPeopleResponseGridLayer = ({
  data,
  color = [255, 140, 0],
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
  const color = RESPONSE_TYPE_COLORS[responseType] || [255, 140, 0];
  return createPeopleResponseGridLayer({
    data,
    color,
    idSuffix: `-${responseType}`,
  });
};
