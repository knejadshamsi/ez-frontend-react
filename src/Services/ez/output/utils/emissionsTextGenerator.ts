import type {
  EZEmissionsParagraph1Data,
  EZEmissionsParagraph2Data
} from '~stores/output';

type ComparisonMode = 'past' | 'present' | 'gerund' | 'noun';
type ComparisonDirection = 'increase' | 'decrease' | 'stable';
type ComparisonMagnitude = 'stable' | 'slight' | 'moderate' | 'dramatic';

interface ComparisonResult {
  percentChange: number;
  baseline: number;
  postValue: number;
  magnitude: ComparisonMagnitude;
  direction: ComparisonDirection;
  getVerb: (mode: ComparisonMode) => string;
  getDescription: (mode: ComparisonMode) => string;
}

type Pollutant = 'pm25' | 'pm10' | 'no2';

interface WHOThresholds {
  guideline: number;
  interimTargets: number[];
}

const DEFAULT_COMPARISON_THRESHOLDS = {
  stable: 5,
  slight: 10,
  dramatic: 50
} as const;

const SLIGHT_SYNONYMS = [
  'slightly',
  'marginally',
  'modestly',
  'somewhat',
  'minimally'
] as const;

const DRAMATIC_SYNONYMS = [
  'dramatically',
  'significantly',
  'substantially',
  'considerably',
  'markedly',
  'sharply',
  'greatly',
  'massively',
  'largely'
] as const;

const VERB_CONJUGATIONS = {
  increase: {
    past: 'increased',
    present: 'increases',
    gerund: 'increasing',
    noun: 'increase'
  },
  decrease: {
    past: 'decreased',
    present: 'decreases',
    gerund: 'decreasing',
    noun: 'decrease'
  },
  stable: {
    past: 'remained stable',
    present: 'remains stable',
    gerund: 'remaining stable',
    noun: 'stability'
  }
} as const;

const WHO_GUIDELINES: Record<Pollutant, WHOThresholds> = {
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

const INTERIM_TARGET_NAMES = {
  pm25: ['Interim Target 4', 'Interim Target 3', 'Interim Target 2', 'Interim Target 1'],
  pm10: ['Interim Target 4', 'Interim Target 3', 'Interim Target 2', 'Interim Target 1'],
  no2: ['Interim Target 2', 'Interim Target 1']
} as const;

const PARIS_AGREEMENT_TRANSPORT_REDUCTION = 0.59;

const CITY_BENCHMARKS = {
  londonULEZ: 13,
  parisZFE: 11
} as const;

const BOX_MODEL_CONSTANTS = {
  MICROGRAMS_PER_TONNE: 1e12,
  SQUARE_METERS_PER_KM2: 1e6,
  DEFAULT_MIXING_HEIGHT_M: 1000,
  DEFAULT_AREA_KM2: 42.5
} as const;

// HELPER FUNCTIONS

function getRandomSynonym(synonyms: readonly string[]): string {
  return synonyms[Math.floor(Math.random() * synonyms.length)];
}

function calculateComparison(
  baseline: number,
  postValue: number,
  options?: {
    stableThreshold?: number;
    slightThreshold?: number;
    dramaticThreshold?: number;
  }
): ComparisonResult {
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

  const getVerb = (mode: ComparisonMode): string => {
    return VERB_CONJUGATIONS[direction][mode];
  };

  const getDescription = (mode: ComparisonMode): string => {
    const verb = getVerb(mode);

    if (magnitude === 'stable') {
      return verb;
    } else if (magnitude === 'slight') {
      const adjective = getRandomSynonym(SLIGHT_SYNONYMS);
      return `${adjective} ${verb}`;
    } else if (magnitude === 'moderate') {
      return verb;
    } else {
      const adjective = getRandomSynonym(DRAMATIC_SYNONYMS);
      return `${adjective} ${verb}`;
    }
  };

  return {
    percentChange,
    baseline,
    postValue,
    magnitude,
    direction,
    getVerb,
    getDescription
  };
}

function tonnesToConcentration(
  tonnesPerDay: number,
  area: number = BOX_MODEL_CONSTANTS.DEFAULT_AREA_KM2,
  mixingHeight: number = BOX_MODEL_CONSTANTS.DEFAULT_MIXING_HEIGHT_M
): number {
  const microgramsPerDay = tonnesPerDay * BOX_MODEL_CONSTANTS.MICROGRAMS_PER_TONNE;
  const volumeM3 = area * BOX_MODEL_CONSTANTS.SQUARE_METERS_PER_KM2 * mixingHeight;
  const concentrationUgM3 = microgramsPerDay / volumeM3;
  return Math.round(concentrationUgM3 * 10) / 10;
}

function getWHOTargetPosition(value: number, pollutant: Pollutant): string {
  const thresholds = WHO_GUIDELINES[pollutant];
  const targetNames = INTERIM_TARGET_NAMES[pollutant];
  const guideline = thresholds.guideline;

  if (value <= guideline) {
    return `meets WHO guideline (${guideline} µg/m³)`;
  }

  for (let i = 0; i < thresholds.interimTargets.length; i++) {
    const target = thresholds.interimTargets[i];

    if (value <= target) {
      const diff = value - guideline;

      if (i === 0) {
        return `${diff.toFixed(1)} µg/m³ above WHO guideline (${guideline} µg/m³) but meets ${targetNames[i]} (${target} µg/m³)`;
      }

      if (pollutant !== 'no2' && i === 1) {
        return `${diff.toFixed(1)} µg/m³ above WHO guideline (${guideline} µg/m³ annual mean) but ${(target - value).toFixed(1)} µg/m³ below ${targetNames[i]} (${target} µg/m³)`;
      }

      return `${diff.toFixed(1)} µg/m³ above WHO guideline (${guideline} µg/m³) but ${(target - value).toFixed(1)} µg/m³ below ${targetNames[i]} (${target} µg/m³)`;
    }
  }

  const diff = value - guideline;
  return `${diff.toFixed(1)} µg/m³ above WHO guideline (${guideline} µg/m³), exceeds all interim targets`;
}

function getParisAgreementProgress(percentReduction: number): number {
  return Math.round((percentReduction / (PARIS_AGREEMENT_TRANSPORT_REDUCTION * 100)) * 100);
}

// EXPORTED FUNCTIONS

export function generateEmissionsParagraph1Text(data: EZEmissionsParagraph1Data | null): string {
  if (!data) return '';

  const co2Comparison = calculateComparison(data.co2Baseline, data.co2PostPolicy);
  const percentChange = co2Comparison.percentChange;
  const parisProgress = getParisAgreementProgress(percentChange);

  let co2Sentence: string;
  if (co2Comparison.magnitude === 'stable') {
    co2Sentence = `CO2 emissions ${co2Comparison.getDescription('past')} at approximately ${data.co2Baseline.toLocaleString()} tonnes daily, with minimal change (${percentChange.toFixed(1)}%).`;
  } else {
    co2Sentence = `CO2 emissions ${co2Comparison.getDescription('past')} by ${percentChange.toFixed(1)}%, from ${data.co2Baseline.toLocaleString()} to ${data.co2PostPolicy.toLocaleString()} tonnes daily.`;
  }

  const parisContext = `This achieves ${parisProgress}% of the Paris Agreement transport reduction pathway (${(PARIS_AGREEMENT_TRANSPORT_REDUCTION * 100).toFixed(0)}% by 2050 to limit warming to 1.5°C).`;
  const modeShiftContext = `The reduction came from mode shift affecting ${data.modeShiftPercentage.toFixed(0)}% of car trips.`;

  return `${co2Sentence} ${parisContext} ${modeShiftContext}`;
}

export function generateEmissionsParagraph2Text(data: EZEmissionsParagraph2Data | null): string {
  if (!data) return '';

  const pm25Concentration = tonnesToConcentration(
    data.pm25PostPolicy,
    data.zoneAreaKm2,
    data.mixingHeightMeters
  );

  const whoPosition = getWHOTargetPosition(pm25Concentration, 'pm25');
  const pm25Sentence = `PM2.5 concentration fell to ${pm25Concentration} µg/m³, ${whoPosition}.`;

  const evDelta = data.electricVehicleSharePostPolicy - data.electricVehicleShareBaseline;
  const standardDelta = data.standardVehicleSharePostPolicy - data.standardVehicleShareBaseline;
  const heavyDelta = data.heavyVehicleSharePostPolicy - data.heavyVehicleShareBaseline;

  const fleetTransition = `Fleet composition shifted towards electrification, with electric vehicles gaining ${Math.abs(evDelta).toFixed(1)} percentage points while standard combustion vehicles declined ${Math.abs(standardDelta).toFixed(1)} percentage points. Heavy vehicles ${heavyDelta >= 0 ? 'increased' : 'decreased'} ${Math.abs(heavyDelta).toFixed(1)} percentage points, reflecting expanded freight and transit operations.`;

  const cityComparison = `London's Ultra Low Emission Zone reached ${CITY_BENCHMARKS.londonULEZ} µg/m³ after two years. Paris' Zone à Faibles Émissions achieved ${CITY_BENCHMARKS.parisZFE} µg/m³.`;

  return `${pm25Sentence} ${fleetTransition} ${cityComparison}`;
}
