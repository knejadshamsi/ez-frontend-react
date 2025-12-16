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

// Convert hex color string to RGB array (Used to apply zone/area colors to editable layers)
export const hexToRgb = (hex: string): [number, number, number] => {
  // Remove # if present
  const cleanHex = hex.replace('#', '');

  // Parse hex color
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cleanHex);

  if (!result) {
    console.warn('[hexToRgb] Invalid hex color:', hex, '- defaulting to red');
    return [255, 0, 0];
  }

  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ];
};
