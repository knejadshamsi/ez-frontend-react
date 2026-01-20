import { Spin, Alert, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { useEZOutputPeopleResponseStore, type EZPeopleResponseParagraph1Data } from '~stores/output';
import { useEZSessionStore } from '~stores/session';
import { retryComponentData } from '~ez/api';
import {
  LEZ_BENCHMARKS,
  BEHAVIOR_THRESHOLDS,
  BENCHMARK_DELTAS
} from '../utils/calculations';
import { HighlightedText } from '../utils';
import outputStyles from '../Output.module.less';

// ENGLISH TEXT GENERATION

interface BehaviorSplit {
  avoidancePct: number;
  modalShiftPct: number;
  characterization: string;
}

function calculateBehaviorSplit(data: EZPeopleResponseParagraph1Data): BehaviorSplit {
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

  return `The $${data.penaltyChargeAmount.toFixed(2)} charge resulted in ${data.paidPenaltyPercentage.toFixed(0)}% choosing to pay the penalty.`;
}

function generateEnglishParagraph1(data: EZPeopleResponseParagraph1Data): string {
  const { avoidancePct, modalShiftPct, characterization } = calculateBehaviorSplit(data);
  const benchmarkComparison = compareToBenchmarks(modalShiftPct);

  const sentence1 = `Affected trips ${characterization}, with ${avoidancePct.toFixed(0)}% choosing avoidance (${data.paidPenaltyPercentage.toFixed(0)}% paid penalty, ${data.reroutedPercentage.toFixed(0)}% rerouted) versus ${modalShiftPct.toFixed(0)}% adopting sustainable modes.`;
  const sentence2 = `Modal shift performance ${benchmarkComparison}.`;
  const votAnalysis = analyzeValueOfTime(data);
  const sentence3 = votAnalysis || '';

  return [sentence1, sentence2, sentence3].filter(s => s).join(' ');
}

// FRENCH TEXT GENERATION

interface RepartitionComportement {
  pctEvitement: number;
  pctTransfertModal: number;
  caracterisation: string;
}

function calculerRepartitionComportement(data: EZPeopleResponseParagraph1Data): RepartitionComportement {
  const pctEvitement = data.paidPenaltyPercentage + data.reroutedPercentage;
  const pctTransfertModal = data.switchedToBusPercentage + data.switchedToSubwayPercentage +
                           data.switchedToWalkingPercentage + data.switchedToBikingPercentage;

  let caracterisation: string;
  if (pctEvitement > BEHAVIOR_THRESHOLDS.OVERWHELMING) {
    caracterisation = "ont largement privilégié les stratégies d'évitement";
  } else if (pctEvitement > BEHAVIOR_THRESHOLDS.PREDOMINANT) {
    caracterisation = "ont principalement choisi les stratégies d'évitement";
  } else if (pctTransfertModal > BEHAVIOR_THRESHOLDS.OVERWHELMING) {
    caracterisation = "ont largement adopté les modes durables";
  } else if (pctTransfertModal > BEHAVIOR_THRESHOLDS.PREDOMINANT) {
    caracterisation = "ont principalement opté pour les modes durables";
  } else if (Math.abs(pctEvitement - pctTransfertModal) < BEHAVIOR_THRESHOLDS.BALANCED) {
    caracterisation = "ont montré une réponse équilibrée entre évitement et transfert modal";
  } else if (pctTransfertModal > pctEvitement) {
    caracterisation = "ont favorisé le transfert modal plutôt que l'évitement";
  } else {
    caracterisation = "ont favorisé l'évitement plutôt que le transfert modal";
  }

  return { pctEvitement, pctTransfertModal, caracterisation };
}

function comparerAuxReferences(pctTransfertModal: number): string {
  const diffLondres = pctTransfertModal - LEZ_BENCHMARKS.londonULEZ;
  const diffParis = pctTransfertModal - LEZ_BENCHMARKS.parisZFE;

  if (pctTransfertModal >= LEZ_BENCHMARKS.parisZFE) {
    if (diffParis > BENCHMARK_DELTAS.SIGNIFICANT_OUTPERFORM) {
      return `surpasse nettement Londres ULEZ (${LEZ_BENCHMARKS.londonULEZ} %) et Paris ZFE (${LEZ_BENCHMARKS.parisZFE} %), dépassant Paris de ${diffParis.toFixed(1).replace('.', ',')} points de pourcentage`;
    } else if (diffParis > BENCHMARK_DELTAS.MODERATE_OUTPERFORM) {
      return `surpasse Londres ULEZ (${LEZ_BENCHMARKS.londonULEZ} %) et Paris ZFE (${LEZ_BENCHMARKS.parisZFE} %), dépassant Paris de ${diffParis.toFixed(1).replace('.', ',')} points de pourcentage`;
    } else {
      return `égale la performance de Paris ZFE (${LEZ_BENCHMARKS.parisZFE} %), surpassant Londres ULEZ (${LEZ_BENCHMARKS.londonULEZ} %)`;
    }
  } else if (pctTransfertModal >= LEZ_BENCHMARKS.londonULEZ) {
    if (diffLondres > 0) {
      return `surpasse Londres ULEZ (${LEZ_BENCHMARKS.londonULEZ} %) de ${diffLondres.toFixed(1).replace('.', ',')} points de pourcentage mais reste en deçà de Paris ZFE (${LEZ_BENCHMARKS.parisZFE} %) de ${Math.abs(diffParis).toFixed(1).replace('.', ',')} points de pourcentage`;
    } else {
      return `égale la performance de Londres ULEZ (${LEZ_BENCHMARKS.londonULEZ} %) mais reste en deçà de Paris ZFE (${LEZ_BENCHMARKS.parisZFE} %) de ${Math.abs(diffParis).toFixed(1).replace('.', ',')} points de pourcentage`;
    }
  } else {
    if (diffLondres > BENCHMARK_DELTAS.SIGNIFICANT_UNDERPERFORM) {
      return `reste en deçà de Londres ULEZ (${LEZ_BENCHMARKS.londonULEZ} %) de ${Math.abs(diffLondres).toFixed(1).replace('.', ',')} points de pourcentage et de Paris ZFE (${LEZ_BENCHMARKS.parisZFE} %) de ${Math.abs(diffParis).toFixed(1).replace('.', ',')} points de pourcentage`;
    } else {
      return `reste nettement en deçà de Londres ULEZ (${LEZ_BENCHMARKS.londonULEZ} %) et de Paris ZFE (${LEZ_BENCHMARKS.parisZFE} %), avec des écarts de ${Math.abs(diffLondres).toFixed(1).replace('.', ',')} et ${Math.abs(diffParis).toFixed(1).replace('.', ',')} points de pourcentage respectivement`;
    }
  }
}

function analyserValeurDuTemps(data: EZPeopleResponseParagraph1Data): string | null {
  if (!data.penaltyChargeAmount || data.paidPenaltyPercentage === 0) {
    return null;
  }

  return `Des frais de ${data.penaltyChargeAmount.toFixed(2).replace('.', ',')} $ ont entraîné que ${data.paidPenaltyPercentage.toFixed(0)} % ont choisi de payer la pénalité.`;
}

function generateFrenchParagraph1(data: EZPeopleResponseParagraph1Data): string {
  const { pctEvitement, pctTransfertModal, caracterisation } = calculerRepartitionComportement(data);
  const comparaisonReferences = comparerAuxReferences(pctTransfertModal);

  const phrase1 = `Les déplacements touchés ${caracterisation}, avec ${pctEvitement.toFixed(0)} % choisissant l'évitement (${data.paidPenaltyPercentage.toFixed(0)} % ont payé la pénalité, ${data.reroutedPercentage.toFixed(0)} % ont dévié leur trajet) contre ${pctTransfertModal.toFixed(0)} % adoptant des modes durables.`;
  const phrase2 = `La performance du transfert modal ${comparaisonReferences}.`;
  const analyseVDT = analyserValeurDuTemps(data);
  const phrase3 = analyseVDT || '';

  return [phrase1, phrase2, phrase3].filter(p => p).join(' ');
}

/**
 * People Response Paragraph 1 - behavioral breakdown and benchmarks
 * SSE Message: data_text_paragraph1_people_response
 */
export const PeopleResponseParagraph1 = () => {
  const { i18n, t } = useTranslation('ez-output');
  const paragraph1Data = useEZOutputPeopleResponseStore((state) => state.peopleResponseParagraph1Data);
  const paragraph1State = useEZOutputPeopleResponseStore((state) => state.peopleResponseParagraph1State);
  const paragraph1Error = useEZOutputPeopleResponseStore((state) => state.peopleResponseParagraph1Error);
  const requestId = useEZSessionStore((state) => state.requestId);

  const handleRetry = async () => {
    if (requestId) {
      await retryComponentData(requestId, 'text_paragraph1_people_response');
    }
  };

  if (paragraph1Error) {
    return (
      <Alert
        message={t('paragraphs.peopleResponse1Error')}
        description={paragraph1Error}
        type="error"
        showIcon
        className={outputStyles.sectionErrorAlert}
        action={
          <Button size="small" danger onClick={handleRetry}>
            {t('paragraphs.retry')}
          </Button>
        }
      />
    );
  }

  if (paragraph1State === 'inactive' || paragraph1State === 'loading' || !paragraph1Data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <Spin size="small" />
      </div>
    );
  }

  const paragraphText = i18n.language === 'fr'
    ? generateFrenchParagraph1(paragraph1Data)
    : generateEnglishParagraph1(paragraph1Data);

  return (
    <p className={outputStyles.contentParagraph}>
      <HighlightedText text={paragraphText} />
    </p>
  );
};
