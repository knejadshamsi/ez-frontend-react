
import { PathLayer } from '@deck.gl/layers';
import type { MapPathData } from '~stores/output';

export interface CreateTripLegsPathLayerInput {
  data: MapPathData[]; // Array of path data
  selectedPathId?: string | null; // ID of selected path to highlight
  idSuffix?: string; // Optional layer ID suffix
}

// Get path color based on CO2 delta
const getPathColor = (co2Delta: number, isSelected: boolean): [number, number, number, number] => {
  if (isSelected) {
    return [0, 100, 255, 255]; // Bright blue for selected
  }

  // Normalize and interpolate color
  const normalizedDelta = Math.max(-500, Math.min(500, co2Delta));
  const ratio = (normalizedDelta + 500) / 1000;
  const r = Math.round(ratio * 255);
  const g = Math.round((1 - ratio) * 200);
  const b = 50;

  return [r, g, b, 180];
};

// Create a path layer for trip legs visualization
export const createTripLegsPathLayer = ({
  data,
  selectedPathId = null,
  idSuffix = '',
}: CreateTripLegsPathLayerInput) => {
  return new PathLayer<MapPathData>({
    id: `ez-trip-legs-path${idSuffix}`,
    data,
    getPath: (d) => d.path,
    getColor: (d) => getPathColor(d.co2Delta, d.id === selectedPathId),
    getWidth: (d) => (d.id === selectedPathId ? 8 : 4),
    widthMinPixels: 2,
    widthMaxPixels: 10,
    capRounded: true,
    jointRounded: true,
    pickable: true,
  });
};

// Create a highlight layer for the selected path
export const createTripLegsHighlightLayer = ({
  data,
  selectedPathId,
  idSuffix = '',
}: CreateTripLegsPathLayerInput) => {
  if (!selectedPathId) return null;

  const selectedPath = data.find((d) => d.id === selectedPathId);
  if (!selectedPath) return null;

  return new PathLayer<MapPathData>({
    id: `ez-trip-legs-highlight${idSuffix}`,
    data: [selectedPath],
    getPath: (d) => d.path,
    getColor: [0, 100, 255, 255], // Bright blue
    getWidth: 10,
    widthMinPixels: 4,
    capRounded: true,
    jointRounded: true,
    pickable: false,
  });
};
