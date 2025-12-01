import type {
  EZPeopleResponseParagraph1Data,
  EZPeopleResponseParagraph2Data
} from '~stores/output';

// CONSTANTS

const LEZ_BENCHMARKS = {
  londonULEZ: 30,
  parisZFE: 35
} as const;

const MARCHETTI_CONSTANT = 66;

const BEHAVIOR_THRESHOLDS = {
  OVERWHELMING: 70,
  PREDOMINANT: 60,
  BALANCED: 10
} as const;

const BENCHMARK_DELTAS = {
  SIGNIFICANT_OUTPERFORM: 10,
  MODERATE_OUTPERFORM: 5,
  SIGNIFICANT_UNDERPERFORM: -10
} as const;

const ELASTICITY_THRESHOLDS = {
  LOW: 5,
  MODERATE: 15
} as const;

const REROUTING_THRESHOLDS = {
  TIME_SAVINGS: -1,
  TIME_PENALTY: 3
} as const;

// HELPER FUNCTIONS

function calculateBehaviorSplit(data: EZPeopleResponseParagraph1Data): {
  avoidancePct: number;
  modalShiftPct: number;
  characterization: string;
} {
  const avoidancePct = data.paidPenaltyPercentage + data.reroutedPercentage;
  const modalShiftPct = data.switchedToBusPercentage + data.switchedToSubwayPercentage +
                        data.switchedToWalkingPercentage + data.switchedToBikingPercentage;

  let characterization: string;
  if (avoidancePct > BEHAVIOR_THRESHOLDS.OVERWHELMING) {
    characterization = 'overwhelmingly favored avoidance strategies';
  } else if (avoidancePct > BEHAVIOR_THRESHOLDS.PREDOMINANT) {
    characterization = 'predominantly chose avoidance strategies';
  } else if (modalShiftPct > BEHAVIOR_THRESHOLDS.OVERWHELMING) {
    characterization = 'overwhelmingly adopted sustainable modes';
  } else if (modalShiftPct > BEHAVIOR_THRESHOLDS.PREDOMINANT) {
    characterization = 'predominantly shifted to sustainable modes';
  } else if (Math.abs(avoidancePct - modalShiftPct) < BEHAVIOR_THRESHOLDS.BALANCED) {
    characterization = 'showed balanced response between avoidance and modal shift';
  } else if (modalShiftPct > avoidancePct) {
    characterization = 'favored modal shift over avoidance';
  } else {
    characterization = 'favored avoidance over modal shift';
  }

  return { avoidancePct, modalShiftPct, characterization };
}

function compareToBenchmarks(modalShiftPct: number): string {
  const londonDiff = modalShiftPct - LEZ_BENCHMARKS.londonULEZ;
  const parisDiff = modalShiftPct - LEZ_BENCHMARKS.parisZFE;

  if (modalShiftPct >= LEZ_BENCHMARKS.parisZFE) {
    if (parisDiff > BENCHMARK_DELTAS.SIGNIFICANT_OUTPERFORM) {
      return `significantly outperforms both London ULEZ (${LEZ_BENCHMARKS.londonULEZ}%) and Paris ZFE (${LEZ_BENCHMARKS.parisZFE}%), exceeding Paris by ${parisDiff.toFixed(1)} percentage points`;
    } else if (parisDiff > BENCHMARK_DELTAS.MODERATE_OUTPERFORM) {
      return `outperforms both London ULEZ (${LEZ_BENCHMARKS.londonULEZ}%) and Paris ZFE (${LEZ_BENCHMARKS.parisZFE}%), exceeding Paris by ${parisDiff.toFixed(1)} percentage points`;
    } else {
      return `matches Paris ZFE performance (${LEZ_BENCHMARKS.parisZFE}%), outperforming London ULEZ (${LEZ_BENCHMARKS.londonULEZ}%)`;
    }
  } else if (modalShiftPct >= LEZ_BENCHMARKS.londonULEZ) {
    if (londonDiff > 0) {
      return `outperforms London ULEZ (${LEZ_BENCHMARKS.londonULEZ}%) by ${londonDiff.toFixed(1)} percentage points but lags Paris ZFE (${LEZ_BENCHMARKS.parisZFE}%) by ${Math.abs(parisDiff).toFixed(1)} percentage points`;
    } else {
      return `matches London ULEZ performance (${LEZ_BENCHMARKS.londonULEZ}%) but lags Paris ZFE (${LEZ_BENCHMARKS.parisZFE}%) by ${Math.abs(parisDiff).toFixed(1)} percentage points`;
    }
  } else {
    if (londonDiff > BENCHMARK_DELTAS.SIGNIFICANT_UNDERPERFORM) {
      return `lags London ULEZ (${LEZ_BENCHMARKS.londonULEZ}%) by ${Math.abs(londonDiff).toFixed(1)} percentage points and Paris ZFE (${LEZ_BENCHMARKS.parisZFE}%) by ${Math.abs(parisDiff).toFixed(1)} percentage points`;
    } else {
      return `significantly lags both London ULEZ (${LEZ_BENCHMARKS.londonULEZ}%) and Paris ZFE (${LEZ_BENCHMARKS.parisZFE}%), falling short by ${Math.abs(londonDiff).toFixed(1)} and ${Math.abs(parisDiff).toFixed(1)} percentage points respectively`;
    }
  }
}

function analyzeValueOfTime(data: EZPeopleResponseParagraph1Data): string | null {
  if (!data.penaltyChargeAmount || data.paidPenaltyPercentage === 0) {
    return null;
  }

  return `The £${data.penaltyChargeAmount.toFixed(2)} charge resulted in ${data.paidPenaltyPercentage.toFixed(0)}% choosing to pay the penalty.`;
}

function interpretReroutingImpact(reroutedPct: number, reroutedTime: number): string {
  if (reroutedPct < 5) {
    return '';
  }

  if (reroutedTime < REROUTING_THRESHOLDS.TIME_SAVINGS) {
    return `Rerouting saved an average of ${Math.abs(reroutedTime).toFixed(1)} minutes, revealing the zone was previously a congestion point.`;
  } else if (reroutedTime > REROUTING_THRESHOLDS.TIME_PENALTY) {
    return `Rerouting added an average of ${reroutedTime.toFixed(1)} minutes, indicating limited alternative route capacity.`;
  } else {
    return `Rerouting had minimal time impact (${reroutedTime >= 0 ? '+' : ''}${reroutedTime.toFixed(1)} minutes), suggesting adequate alternative routes.`;
  }
}

function analyzeElasticity(cancelledPct: number): string {
  if (cancelledPct < ELASTICITY_THRESHOLDS.LOW) {
    return `Trip cancellations remained low (${cancelledPct.toFixed(1)}%), indicating inelastic demand—most trips were essential and unavoidable.`;
  } else if (cancelledPct < ELASTICITY_THRESHOLDS.MODERATE) {
    return `Moderate trip cancellations (${cancelledPct.toFixed(1)}%) suggest a mix of essential and discretionary travel.`;
  } else {
    return `High trip cancellations (${cancelledPct.toFixed(1)}%) indicate elastic demand—many trips were discretionary and easily foregone.`;
  }
}

// EXPORTED FUNCTIONS

export function generatePeopleResponseParagraph1Text(data: EZPeopleResponseParagraph1Data | null): string {
  if (!data) return '';

  const { avoidancePct, modalShiftPct, characterization } = calculateBehaviorSplit(data);
  const benchmarkComparison = compareToBenchmarks(modalShiftPct);

  const sentence1 = `Affected trips ${characterization}, with ${avoidancePct.toFixed(0)}% choosing avoidance (${data.paidPenaltyPercentage.toFixed(0)}% paid penalty, ${data.reroutedPercentage.toFixed(0)}% rerouted) versus ${modalShiftPct.toFixed(0)}% adopting sustainable modes.`;
  const sentence2 = `Modal shift performance ${benchmarkComparison}.`;
  const votAnalysis = analyzeValueOfTime(data);
  const sentence3 = votAnalysis || '';

  return [sentence1, sentence2, sentence3].filter(s => s).join(' ');
}

export function generatePeopleResponseParagraph2Text(
  paragraph1Data: EZPeopleResponseParagraph1Data | null,
  paragraph2Data: EZPeopleResponseParagraph2Data | null
): string {
  if (!paragraph1Data || !paragraph2Data) return '';

  const sentences: string[] = [];

  const modalShiftTimes = [
    { mode: 'bus', pct: paragraph1Data.switchedToBusPercentage, time: paragraph2Data.averageTimeSwitchedToBus },
    { mode: 'subway', pct: paragraph1Data.switchedToSubwayPercentage, time: paragraph2Data.averageTimeSwitchedToSubway },
    { mode: 'walking', pct: paragraph1Data.switchedToWalkingPercentage, time: paragraph2Data.averageTimeSwitchedToWalking },
    { mode: 'biking', pct: paragraph1Data.switchedToBikingPercentage, time: paragraph2Data.averageTimeSwitchedToBiking }
  ].filter(m => m.pct > 0);

  if (modalShiftTimes.length > 0) {
    const times = modalShiftTimes.map(m => m.time);
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    const minPct = (Math.abs(minTime) / MARCHETTI_CONSTANT * 100).toFixed(0);
    const maxPct = (Math.abs(maxTime) / MARCHETTI_CONSTANT * 100).toFixed(0);

    if (minTime < 0 && maxTime < 0) {
      sentences.push(`Mode shifters saved ${Math.abs(maxTime).toFixed(0)}-${Math.abs(minTime).toFixed(0)} minutes (${minPct}-${maxPct}% of the ${MARCHETTI_CONSTANT}-minute Marchetti travel budget), suggesting transit and active modes were already competitive.`);
    } else if (minTime >= 0 && maxTime >= 0) {
      sentences.push(`Mode shifters incurred ${minTime.toFixed(0)}-${maxTime.toFixed(0)} minute time penalties (${minPct}-${maxPct}% of the ${MARCHETTI_CONSTANT}-minute Marchetti travel budget), revealing infrastructure gaps that reduced transit competitiveness.`);
    } else {
      sentences.push(`Time impacts varied: some modes saved up to ${Math.abs(minTime).toFixed(0)} minutes while others added ${maxTime.toFixed(0)} minutes (${minPct}-${maxPct}% of the ${MARCHETTI_CONSTANT}-minute Marchetti travel budget), indicating uneven transit coverage.`);
    }
  }

  const reroutingAnalysis = interpretReroutingImpact(
    paragraph1Data.reroutedPercentage,
    paragraph2Data.averageTimeRerouted
  );
  if (reroutingAnalysis) {
    sentences.push(reroutingAnalysis);
  }

  const elasticityAnalysis = analyzeElasticity(paragraph1Data.cancelledTripPercentage);
  sentences.push(elasticityAnalysis);

  return sentences.join(' ');
}
