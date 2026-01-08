import { polygon, area, booleanWithin } from '@turf/turf';
import { Coordinate } from '~stores/types';

// Montreal area boundary polygon
const MTL_AREA = polygon([
  [
    [-73.61197208186829, 45.41263857780996],
    [-73.52288866657636, 45.460662325514306],
    [-73.54276354237754, 45.52113298596623],
    [-73.49833116562328, 45.58727093205829],
    [-73.48051362666197, 45.65133852134059],
    [-73.48746263932175, 45.6803086372245],
    [-73.47404385625444, 45.70374168629593],
    [-73.49944369563231, 45.69888850379368],
    [-73.5138209632041, 45.701398823201345],
    [-73.54473208848428, 45.67478370290971],
    [-73.6190146376082, 45.63977978412598],
    [-73.64082016009277, 45.61430864477978],
    [-73.64574663581253, 45.59983053862982],
    [-73.66782369637252, 45.57333109890186],
    [-73.67397851325528, 45.55928038695987],
    [-73.68187273490963, 45.55150414931842],
    [-73.70609060134132, 45.545694691369846],
    [-73.73539288172076, 45.529949916543444],
    [-73.76498414196323, 45.51162949431537],
    [-73.81497202590612, 45.51687179529219],
    [-73.84607368634126, 45.517948201616974],
    [-73.85895763384994, 45.50467075449677],
    [-73.85862079862109, 45.49510905306582],
    [-73.90468980997117, 45.46423059431703],
    [-73.92637470205938, 45.47526334590961],
    [-73.97888615643005, 45.46095017063175],
    [-73.97973654435545, 45.419779546162886],
    [-73.95635087641645, 45.402466983784336],
    [-73.91191810733349, 45.40216844479252],
    [-73.78627329140986, 45.43529664210331],
    [-73.63795532007236, 45.412836680990864],
    [-73.61197208186829, 45.41263857780996],
  ],
]);

// Constants for area validation (in square meters)
export const EMISSION_ZONE_CONSTRAINTS = {
  MIN_AREA_SQ_KM: 0.5,
  MAX_AREA_SQ_KM: 5,
  MIN_AREA_SQ_M: 0.5 * 1_000_000,  // 500,000 sq meters
  MAX_AREA_SQ_M: 5 * 1_000_000,   // 5,000,000 sq meters
} as const;

export const SIMULATION_AREA_CONSTRAINTS = {
  MIN_AREA_SQ_KM: 0.5,
  MAX_AREA_SQ_KM: 6,
  MIN_AREA_SQ_M: 0.5 * 1_000_000,  // 500,000 sq meters
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
    const isWithinBoundary = booleanWithin(drawnPolygon, MTL_AREA);

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
