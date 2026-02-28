import { EditableGeoJsonLayer, DrawPolygonMode, ModifyMode, type FeatureCollection } from '@deck.gl-community/editable-layers';
import { LAYER_OPACITY, FALLBACK_RED } from './constants';

interface CreateEditablePolygonLayerInput {
  geoJsonData: FeatureCollection;
  onEdit: (editInfo: any) => void;
  mode: 'draw' | 'modify';
  color?: [number, number, number];
  type: 'zone' | 'area';
}

// Handles drawing and editing 
export const createEditablePolygonLayer = ({
  geoJsonData,
  onEdit,
  mode,
  color = FALLBACK_RED,
  type
}: CreateEditablePolygonLayerInput) => {
  const isModifying = mode === 'modify';
  const deckMode = isModifying ? ModifyMode : DrawPolygonMode;

  return new EditableGeoJsonLayer({
    id: `editable-${type}-layer`,
    data: geoJsonData,
    mode: deckMode,
    selectedFeatureIndexes: isModifying ? [0] : [],  // Select first feature in modify mode
    onEdit: onEdit,
    editHandleType: 'existing',  // Only show handles for existing vertices, not intermediate points

    getFillColor: [...color, LAYER_OPACITY.FILL_PRIMARY],
    getLineColor: [...color, LAYER_OPACITY.BORDER_PRIMARY],

    getTentativeFillColor: [...color, LAYER_OPACITY.FILL_PRIMARY],
    getTentativeLineColor: [...color, LAYER_OPACITY.BORDER_PRIMARY],
    getTentativeLineWidth: isModifying ? 2 : 3,

    getEditHandlePointColor: [255, 255, 255, LAYER_OPACITY.BORDER_FULL],
    getEditHandlePointOutlineColor: [...color, LAYER_OPACITY.BORDER_FULL],
    editHandlePointRadiusScale: 2,
    editHandlePointRadiusMinPixels: isModifying ? 10 : 8,
    editHandlePointRadiusMaxPixels: isModifying ? 14 : 12,

    // Interaction
    pickable: true,
    pickingRadius: isModifying ? 15 : 10,
  });
};
