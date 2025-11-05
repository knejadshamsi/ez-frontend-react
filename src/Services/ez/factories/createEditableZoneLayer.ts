import { EditableGeoJsonLayer, DrawPolygonMode } from '@deck.gl-community/editable-layers';

interface CreateEditableZoneLayerInput {
  geoJsonData: any;
  onEdit: (editInfo: any) => void;
}

export const createEditableZoneLayer = ({
  geoJsonData,
  onEdit
}: CreateEditableZoneLayerInput) => {
  return new EditableGeoJsonLayer({
    id: 'editable-zone-layer',
    data: geoJsonData,
    mode: DrawPolygonMode,
    selectedFeatureIndexes: [],
    onEdit: onEdit,

    getTentativeFillColor: [255, 0, 0, 80],
    getTentativeLineColor: [255, 0, 0, 200],
    getTentativeLineWidth: 3,

    getEditHandlePointColor: [255, 255, 255, 255],
    getEditHandlePointOutlineColor: [255, 0, 0, 255],
    editHandlePointRadiusScale: 2,
    editHandlePointRadiusMinPixels: 8,
    editHandlePointRadiusMaxPixels: 12,

    pickable: true,
    pickingRadius: 10,
  });
};
