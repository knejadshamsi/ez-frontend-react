import { PolygonLayer } from '@deck.gl/layers';
import { PathStyleExtension } from '@deck.gl/extensions';
import type { Coordinate } from '~stores/types';
import { hexToRgb } from '../utils/colorUtils';

interface SimulationAreaDisplayData {
  coords: Coordinate[][];
  color: string;
  type: 'custom' | 'scaled';
}

interface CreateSimulationAreaDisplayLayerInput {
  areas: SimulationAreaDisplayData[];
}

/** Create a dashed outline display layer for simulation areas */
export const createSimulationAreaDisplayLayer = ({
  areas
}: CreateSimulationAreaDisplayLayerInput) => {
  // Return null if no areas
  if (!areas || areas.length === 0) {
    return null;
  }

  return new PolygonLayer({
    id: 'simulation-area-display-layer',
    data: areas,
    getPolygon: (d: SimulationAreaDisplayData) => d.coords,

    getFillColor: [0, 0, 0, 0],  // Fully transparent

    // Colored outline
    getLineColor: (d: SimulationAreaDisplayData): [number, number, number, number] => {
      const rgb = hexToRgb(d.color);
      return [rgb[0], rgb[1], rgb[2], 255];
    },

    getLineWidth: 3,
    pickable: false,
    getDashArray: [8, 4], // Dashed line pattern
    extensions: [new PathStyleExtension({ dash: true })],

    // Disable depth testing to prevent z-fighting
    parameters: {
      depthTest: false,
      depthMask: false
    }
  });
};
