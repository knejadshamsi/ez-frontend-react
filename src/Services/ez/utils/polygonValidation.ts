import { polygon, area, booleanWithin } from '@turf/turf';
import { mtlArea } from '../data/mtlArea';
import { Coordinate } from '~stores/types';

// Constants for area validation (in square meters)
export const EMISSION_ZONE_CONSTRAINTS = {
  MIN_AREA_SQ_KM: 1,
  MAX_AREA_SQ_KM: 5,
  MIN_AREA_SQ_M: 1 * 1_000_000,  // 1,000,000 sq meters
  MAX_AREA_SQ_M: 5 * 1_000_000,   // 5,000,000 sq meters
} as const;

export const SIMULATION_AREA_CONSTRAINTS = {
  MIN_AREA_SQ_KM: 1,
  MAX_AREA_SQ_KM: 6,
  MIN_AREA_SQ_M: 1 * 1_000_000,  // 1,000,000 sq meters
  MAX_AREA_SQ_M: 6 * 1_000_000,   // 6,000,000 sq meters
} as const;

export interface PolygonValidationResult {
  isValid: boolean;
  error?: string;
  errorType?: 'boundary' | 'area_too_small' | 'area_too_large';
  areaInSqKm?: number;
}

// Validates a drawn polygon against area and boundary constraints

export const validatePolygon = (
  coords: Coordinate[][],
  useSimulationAreaConstraints: boolean = false
): PolygonValidationResult => {
  try {
    // Create Turf polygon from coordinates
    const drawnPolygon = polygon(coords);

    // 1. Check if polygon is within MTL area boundary
    const isWithinBoundary = booleanWithin(drawnPolygon, mtlArea);

    if (!isWithinBoundary) {
      return {
        isValid: false,
        error: 'The drawn area must be entirely within the Montreal region boundary.',
        errorType: 'boundary'
      };
    }

    // 2. Calculate area in square meters
    const areaInSqMeters = area(drawnPolygon);
    const areaInSqKm = areaInSqMeters / 1_000_000;

    // Select appropriate constraints
    const constraints = useSimulationAreaConstraints
      ? SIMULATION_AREA_CONSTRAINTS
      : EMISSION_ZONE_CONSTRAINTS;

    // 3. Check minimum area
    if (areaInSqMeters < constraints.MIN_AREA_SQ_M) {
      return {
        isValid: false,
        error: `The drawn area is too small. Minimum area: ${constraints.MIN_AREA_SQ_KM} km² (current: ${areaInSqKm.toFixed(2)} km²)`,
        errorType: 'area_too_small',
        areaInSqKm
      };
    }

    // 4. Check maximum area
    if (areaInSqMeters > constraints.MAX_AREA_SQ_M) {
      return {
        isValid: false,
        error: `The drawn area is too large. Maximum area: ${constraints.MAX_AREA_SQ_KM} km² (current: ${areaInSqKm.toFixed(2)} km²)`,
        errorType: 'area_too_large',
        areaInSqKm
      };
    }

    // Validation passed
    return {
      isValid: true,
      areaInSqKm
    };
  } catch (error) {
    console.error('[Polygon Validation] Error during validation:', error);
    return {
      isValid: false,
      error: 'Failed to validate polygon. Please try drawing again.',
      errorType: 'boundary'
    };
  }
};
