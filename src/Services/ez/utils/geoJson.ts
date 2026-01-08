import type { FeatureCollection } from '@deck.gl-community/editable-layers';
import type { Coordinate } from '~stores/types';

// Convert Coordinate[][] to GeoJSON FeatureCollection (load existing polygon coordinates into the editable layer)
export const coordsToGeoJSON = (coords: Coordinate[][]): FeatureCollection => {
  if (!coords || coords.length === 0) {
    return {
      type: 'FeatureCollection',
      features: []
    };
  }

  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: coords
      },
      properties: {}
    }]
  };
};

// Convert GeoJSON FeatureCollection to Coordinate[][] (Used to extract coordinates from edited polygon for saving)
export const geoJsonToCoords = (geoJson: FeatureCollection): Coordinate[][] | null => {
  if (!geoJson || !geoJson.features || geoJson.features.length === 0) {
    return null;
  }

  const feature = geoJson.features[0];
  if (feature.geometry.type !== 'Polygon') {
    console.warn('[geoJsonToCoords] Expected Polygon geometry, got:', feature.geometry.type);
    return null;
  }

  return feature.geometry.coordinates as Coordinate[][];
};
