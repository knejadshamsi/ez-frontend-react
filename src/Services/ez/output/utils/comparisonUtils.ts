// TYPES

export type ComparisonMode = 'past' | 'present' | 'gerund' | 'noun';
export type ComparisonDirection = 'increase' | 'decrease' | 'stable';
export type ComparisonMagnitude = 'stable' | 'slight' | 'moderate' | 'dramatic';

export interface ComparisonResult {
  percentChange: number;
  baseline: number;
  postValue: number;
  magnitude: ComparisonMagnitude;
  direction: ComparisonDirection;
  getVerb: (mode: ComparisonMode) => string;
  getDescription: (mode: ComparisonMode) => string;
  getSentence: (metric: string, unit: string, mode: ComparisonMode) => string;
}

// CONSTANTS

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

// HELPER FUNCTIONS

function getRandomSynonym(synonyms: readonly string[]): string {
  return synonyms[Math.floor(Math.random() * synonyms.length)];
}

// EXPORTED FUNCTIONS

export function calculateComparison(
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

  const getSentence = (metric: string, unit: string, mode: ComparisonMode): string => {
    const verb = getVerb(mode);
    const description = getDescription(mode);

    if (magnitude === 'stable') {
      return `${metric} ${verb} at approximately ${baseline.toLocaleString()} ${unit}, with minimal change (${percentChange.toFixed(1)}%).`;
    }

    return `${metric} ${description} by ${percentChange.toFixed(1)}%, from ${baseline.toLocaleString()} ${unit} to ${postValue.toLocaleString()} ${unit} daily.`;
  };

  return {
    percentChange,
    baseline,
    postValue,
    magnitude,
    direction,
    getVerb,
    getDescription,
    getSentence
  };
}

export function isSignificantChange(baseline: number, postValue: number, threshold = 10): boolean {
  const percentChange = Math.abs(((postValue - baseline) / baseline) * 100);
  return percentChange >= threshold;
}

export function getPercentageChange(baseline: number, postValue: number): number {
  return ((postValue - baseline) / baseline) * 100;
}
