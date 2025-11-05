import { EditableGeoJsonLayer, DrawPolygonMode } from '@deck.gl-community/editable-layers';

interface CreateEditableSimulationAreaLayerInput {
  geoJsonData: any;
  onEdit: (editInfo: any) => void;
}

export const createEditableSimulationAreaLayer = ({
  geoJsonData,
  onEdit
}: CreateEditableSimulationAreaLayerInput) => {
  return new EditableGeoJsonLayer({
    id: 'editable-simulation-area-layer',
    data: geoJsonData,
    mode: DrawPolygonMode,
    selectedFeatureIndexes: [],
    onEdit: onEdit,

    getTentativeFillColor: [0, 188, 212, 80],
    getTentativeLineColor: [0, 188, 212, 200],
    getTentativeLineWidth: 3,

    getEditHandlePointColor: [255, 255, 255, 255],
    getEditHandlePointOutlineColor: [0, 188, 212, 255],
    editHandlePointRadiusScale: 2,
    editHandlePointRadiusMinPixels: 8,
    editHandlePointRadiusMaxPixels: 12,

    pickable: true,
    pickingRadius: 10,
  });
};
