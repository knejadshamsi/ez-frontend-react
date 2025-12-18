import { polygon, area } from '@turf/turf';
import { Coordinate } from '~stores/types';
import { SIMULATION_AREA_CONSTRAINTS } from './polygonValidation';

export const calculateMaxAllowedScale = (coords: Coordinate[][]): number => {
  try {
    const poly = polygon(coords);
    const zoneAreaSqM = area(poly);

    // Calculate max scale: sqrt(maxSimArea / zoneArea) * 100
    const maxScale = Math.sqrt(
      SIMULATION_AREA_CONSTRAINTS.MAX_AREA_SQ_M / zoneAreaSqM
    ) * 100;

    // Round down to nearest integer
    return Math.floor(maxScale);
  } catch (error) {
    console.error('[scaleUtils] Error calculating max scale:', error);
    return 100; // Fallback to minimum (no scaling)
  }
};
