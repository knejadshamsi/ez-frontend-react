import { PolygonLayer } from '@deck.gl/layers';
import type { Coordinate } from '~stores/types';
import { hexToRgb } from '../utils/colorUtils';

interface ZoneDisplayData {
  coords: Coordinate[][];
  color: string;
}

interface CreateZoneDisplayLayerInput {
  zones: ZoneDisplayData[];
}

/** Create a polygon display layer for emission zones */
export const createZoneDisplayLayer = ({
  zones
}: CreateZoneDisplayLayerInput) => {
  // Return null if no zones
  if (!zones || zones.length === 0) {
    return null;
  }

  return new PolygonLayer({
    id: 'zone-display-layer',
    data: zones,
    getPolygon: (d: ZoneDisplayData) => d.coords,

    // Use zone's individual color with transparency
    getFillColor: (d: ZoneDisplayData): [number, number, number, number] => {
      const rgb = hexToRgb(d.color);
      return [rgb[0], rgb[1], rgb[2], 80];
    },

    // Darker border
    getLineColor: (d: ZoneDisplayData): [number, number, number, number] => {
      const rgb = hexToRgb(d.color);
      return [rgb[0], rgb[1], rgb[2], 200];
    },

    getLineWidth: 2,
    pickable: false,

    // Disable depth testing to prevent z-fighting
    parameters: {
      depthTest: false,
      depthMask: false
    }
  });
};
