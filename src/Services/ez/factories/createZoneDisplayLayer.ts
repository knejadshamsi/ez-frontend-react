import { PolygonLayer } from '@deck.gl/layers';
import type { Coordinate } from '~stores/types';
import { hexToRgb } from '~utils/colors';
import { LAYER_OPACITY } from './constants';

interface ZoneDisplayData {
  coords: Coordinate[][];
  color: string;
}

interface CreateZoneDisplayLayerInput {
  zones: ZoneDisplayData[];
  fillOpacityOverride?: number;
}

/** Create a polygon display layer for emission zones */
export const createZoneDisplayLayer = ({
  zones,
  fillOpacityOverride
}: CreateZoneDisplayLayerInput) => {
  // Return null if no zones
  if (!zones || zones.length === 0) {
    return null;
  }

  const fillOpacity = fillOpacityOverride !== undefined ? fillOpacityOverride : LAYER_OPACITY.FILL_PRIMARY;

  return new PolygonLayer({
    id: 'zone-display-layer',
    data: zones,
    getPolygon: (d: ZoneDisplayData) => d.coords,

    // Use zone's individual color with configurable transparency
    getFillColor: (d: ZoneDisplayData): [number, number, number, number] => {
      const rgb = hexToRgb(d.color);
      return [rgb[0], rgb[1], rgb[2], fillOpacity];
    },

    getLineColor: (d: ZoneDisplayData): [number, number, number, number] => {
      const rgb = hexToRgb(d.color);
      return [rgb[0], rgb[1], rgb[2], LAYER_OPACITY.BORDER_PRIMARY];
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
