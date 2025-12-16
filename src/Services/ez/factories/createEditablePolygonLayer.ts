import { EditableGeoJsonLayer, DrawPolygonMode, ModifyMode, type FeatureCollection } from '@deck.gl-community/editable-layers';

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
  color = [255, 0, 0],
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

    getFillColor: [...color, 80],
    getLineColor: [...color, 200],

    getTentativeFillColor: [...color, 80],
    getTentativeLineColor: [...color, 200],
    getTentativeLineWidth: isModifying ? 2 : 3,

    // Edit handles (vertices)
    getEditHandlePointColor: [255, 255, 255, 255],
    getEditHandlePointOutlineColor: [...color, 255],
    editHandlePointRadiusScale: 2,
    editHandlePointRadiusMinPixels: isModifying ? 10 : 8,
    editHandlePointRadiusMaxPixels: isModifying ? 14 : 12,

    // Interaction
    pickable: true,
    pickingRadius: isModifying ? 15 : 10,
  });
};
