import { ArcLayer, ScatterplotLayer } from '@deck.gl/layers';
import type { TripLegArc } from '~stores/output';

// Mode colors matching Section 2 palette
const MODE_COLORS: Record<string, [number, number, number]> = {
  car: [64, 150, 255],     // blue
  bus: [250, 140, 22],     // orange
  subway: [114, 46, 209],  // purple
  walk: [82, 196, 26],     // green
  bike: [19, 194, 194],    // teal
  pt: [82, 196, 26],       // green (transit access legs)
};

const DEFAULT_COLOR: [number, number, number] = [150, 150, 150];

// Darker version of a color for the target end of the arc
const darken = (rgb: [number, number, number], factor = 0.5): [number, number, number] => [
  Math.round(rgb[0] * factor),
  Math.round(rgb[1] * factor),
  Math.round(rgb[2] * factor),
];

interface CreateTripLegsArcLayerInput {
  data: TripLegArc[];
  scenario: 'baseline' | 'policy';
  idSuffix?: string;
}

// Create arc + origin dot layers for trip legs visualization
// Source end uses the mode color, target end uses a darker shade to show direction
export const createTripLegsArcLayer = ({
  data,
  scenario,
  idSuffix = '',
}: CreateTripLegsArcLayerInput) => {
  return new ArcLayer<TripLegArc>({
    id: `ez-trip-legs-arc-${scenario}${idSuffix}`,
    data,
    getSourcePosition: (d) => d.from,
    getTargetPosition: (d) => d.to,
    getSourceColor: (d) => {
      const rgb = MODE_COLORS[d.mode] || DEFAULT_COLOR;
      return [...rgb, 220] as [number, number, number, number];
    },
    getTargetColor: (d) => {
      const rgb = MODE_COLORS[d.mode] || DEFAULT_COLOR;
      const dark = darken(rgb);
      return [...dark, 220] as [number, number, number, number];
    },
    getWidth: 3,
    greatCircle: false,
    pickable: true,
  });
};

// Create origin dots for selected trip legs
export const createTripLegsOriginDots = ({
  data,
  scenario,
  idSuffix = '',
}: CreateTripLegsArcLayerInput) => {
  return new ScatterplotLayer<TripLegArc>({
    id: `ez-trip-legs-origin-${scenario}${idSuffix}`,
    data,
    getPosition: (d) => d.from,
    getFillColor: (d) => {
      const rgb = MODE_COLORS[d.mode] || DEFAULT_COLOR;
      return [...rgb, 255] as [number, number, number, number];
    },
    getRadius: 80,
    radiusMinPixels: 4,
    radiusMaxPixels: 8,
    pickable: false,
  });
};
