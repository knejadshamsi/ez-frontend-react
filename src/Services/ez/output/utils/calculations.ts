/**
 * Shared calculation utilities for text generation
 * Language-agnostic - contains only pure math, constants, and type definitions
 */

// TYPE DEFINITIONS

export type ComparisonDirection = 'increase' | 'decrease' | 'stable';
export type ComparisonMagnitude = 'stable' | 'slight' | 'moderate' | 'dramatic';
export type Pollutant = 'pm25' | 'pm10' | 'no2';

export interface ComparisonData {
  percentChange: number;
  baseline: number;
  postValue: number;
  magnitude: ComparisonMagnitude;
  direction: ComparisonDirection;
}

export interface WHOThresholds {
  guideline: number;
  interimTargets: readonly number[];
}

export interface WHOTargetAnalysis {
  meetsGuideline: boolean;
  targetIndex: number; // -1 if exceeds all targets, 0-n for interim target index
  differenceFromGuideline: number;
  differenceFromTarget: number;
}

// CONSTANTS - COMPARISON THRESHOLDS

export const DEFAULT_COMPARISON_THRESHOLDS = {
  stable: 5,
  slight: 10,
  dramatic: 50
} as const;

// CONSTANTS - WHO GUIDELINES

export const WHO_GUIDELINES: Record<Pollutant, WHOThresholds> = {
  pm25: {
    guideline: 5,
    interimTargets: [10, 15, 25, 35]
  },
  pm10: {
    guideline: 15,
    interimTargets: [20, 30, 50, 70]
  },
  no2: {
    guideline: 10,
    interimTargets: [20, 40]
  }
} as const;

// CONSTANTS - PARIS AGREEMENT

export const PARIS_AGREEMENT_TRANSPORT_REDUCTION = 0.59;

// CONSTANTS - CITY BENCHMARKS

export const CITY_BENCHMARKS = {
  londonULEZ: 13,
  parisZFE: 11
} as const;

export const LEZ_BENCHMARKS = {
  londonULEZ: 30,
  parisZFE: 35
} as const;

// CONSTANTS - BOX MODEL PHYSICS

export const BOX_MODEL_CONSTANTS = {
  MICROGRAMS_PER_TONNE: 1e12,
  SQUARE_METERS_PER_KM2: 1e6,
  DEFAULT_MIXING_HEIGHT_M: 1000,
  DEFAULT_AREA_KM2: 42.5
} as const;

// CONSTANTS - BEHAVIOR ANALYSIS

export const MARCHETTI_CONSTANT = 66;

export const BEHAVIOR_THRESHOLDS = {
  OVERWHELMING: 70,
  PREDOMINANT: 60,
  BALANCED: 10
} as const;

export const BENCHMARK_DELTAS = {
  SIGNIFICANT_OUTPERFORM: 10,
  MODERATE_OUTPERFORM: 5,
  SIGNIFICANT_UNDERPERFORM: -10
} as const;

export const ELASTICITY_THRESHOLDS = {
  LOW: 5,
  MODERATE: 15
} as const;

export const REROUTING_THRESHOLDS = {
  TIME_SAVINGS: -1,
  TIME_PENALTY: 3
} as const;

// CALCULATION FUNCTIONS
export function calculateComparisonData(
  baseline: number,
  postValue: number,
  options?: {
    stableThreshold?: number;
    slightThreshold?: number;
    dramaticThreshold?: number;
  }
): ComparisonData {
  const stableThreshold = options?.stableThreshold ?? DEFAULT_COMPARISON_THRESHOLDS.stable;
  const slightThreshold = options?.slightThreshold ?? DEFAULT_COMPARISON_THRESHOLDS.slight;
  const dramaticThreshold = options?.dramaticThreshold ?? DEFAULT_COMPARISON_THRESHOLDS.dramatic;

  const percentChange = Math.abs(((postValue - baseline) / baseline) * 100);

  let magnitude: ComparisonMagnitude;
  let direction: ComparisonDirection;

  if (percentChange < stableThreshold) {
    magnitude = 'stable';
    direction = 'stable';
  } else if (percentChange < slightThreshold) {
    magnitude = 'slight';
    direction = postValue > baseline ? 'increase' : 'decrease';
  } else if (percentChange <= dramaticThreshold) {
    magnitude = 'moderate';
    direction = postValue > baseline ? 'increase' : 'decrease';
  } else {
    magnitude = 'dramatic';
    direction = postValue > baseline ? 'increase' : 'decrease';
  }

  return {
    percentChange,
    baseline,
    postValue,
    magnitude,
    direction
  };
}

// Converts tonnes per day to concentration (µg/m³) using box model
export function tonnesToConcentration(
  tonnesPerDay: number,
  area: number = BOX_MODEL_CONSTANTS.DEFAULT_AREA_KM2,
  mixingHeight: number = BOX_MODEL_CONSTANTS.DEFAULT_MIXING_HEIGHT_M
): number {
  const microgramsPerDay = tonnesPerDay * BOX_MODEL_CONSTANTS.MICROGRAMS_PER_TONNE;
  const volumeM3 = area * BOX_MODEL_CONSTANTS.SQUARE_METERS_PER_KM2 * mixingHeight;
  const concentrationUgM3 = microgramsPerDay / volumeM3;
  return Math.round(concentrationUgM3 * 10) / 10;
}

// Analyzes concentration against WHO guidelines
export function analyzeWHOTarget(value: number, pollutant: Pollutant): WHOTargetAnalysis {
  const thresholds = WHO_GUIDELINES[pollutant];
  const guideline = thresholds.guideline;

  if (value <= guideline) {
    return {
      meetsGuideline: true,
      targetIndex: -2,
      differenceFromGuideline: value - guideline,
      differenceFromTarget: 0
    };
  }

  for (let i = 0; i < thresholds.interimTargets.length; i++) {
    const target = thresholds.interimTargets[i];

    if (value <= target) {
      return {
        meetsGuideline: false,
        targetIndex: i,
        differenceFromGuideline: value - guideline,
        differenceFromTarget: target - value
      };
    }
  }

  return {
    meetsGuideline: false,
    targetIndex: -1, // Exceeds all targets
    differenceFromGuideline: value - guideline,
    differenceFromTarget: 0
  };
}

// Calculates progress toward Paris Agreement transport reduction goal
export function getParisAgreementProgress(percentReduction: number): number {
  return Math.round((percentReduction / (PARIS_AGREEMENT_TRANSPORT_REDUCTION * 100)) * 100);
}
