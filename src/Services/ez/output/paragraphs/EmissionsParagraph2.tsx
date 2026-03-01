import { Spin, Alert, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { useEZOutputEmissionsStore, type EZEmissionsParagraph2Data } from '~stores/output';
import { useEZSessionStore } from '~stores/session';
import { retryComponentData } from '~ez/api';
import {
  tonnesToConcentration,
  analyzeWHOTarget,
  WHO_GUIDELINES,
  CITY_BENCHMARKS,
  type Pollutant
} from '../utils/calculations';
import { HighlightedText } from '../utils';
import outputStyles from '../Output.module.less';

// ENGLISH TEXT GENERATION

const INTERIM_TARGET_NAMES = {
  pm25: ['Interim Target 4', 'Interim Target 3', 'Interim Target 2', 'Interim Target 1'],
  pm10: ['Interim Target 4', 'Interim Target 3', 'Interim Target 2', 'Interim Target 1'],
  no2: ['Interim Target 2', 'Interim Target 1']
} as const;

function getWHOTargetDescription(value: number, pollutant: Pollutant): string {
  const analysis = analyzeWHOTarget(value, pollutant);
  const guideline = WHO_GUIDELINES[pollutant].guideline;

  if (analysis.meetsGuideline) {
    return `meets WHO guideline (${guideline} µg/m³)`;
  }

  const targetNames = INTERIM_TARGET_NAMES[pollutant];
  const targetIndex = analysis.targetIndex;

  if (targetIndex === -1) {
    // Exceeds all targets
    return `${analysis.differenceFromGuideline.toFixed(1)} µg/m³ above WHO guideline (${guideline} µg/m³), exceeds all interim targets`;
  }

  // Meets an interim target
  const targetValue = WHO_GUIDELINES[pollutant].interimTargets[targetIndex];
  const targetName = targetNames[targetIndex];

  if (targetIndex === 0) {
    return `${analysis.differenceFromGuideline.toFixed(1)} µg/m³ above WHO guideline (${guideline} µg/m³) but meets ${targetName} (${targetValue} µg/m³)`;
  }

  if (pollutant !== 'no2' && targetIndex === 1) {
    return `${analysis.differenceFromGuideline.toFixed(1)} µg/m³ above WHO guideline (${guideline} µg/m³ annual mean) but ${analysis.differenceFromTarget.toFixed(1)} µg/m³ below ${targetName} (${targetValue} µg/m³)`;
  }

  return `${analysis.differenceFromGuideline.toFixed(1)} µg/m³ above WHO guideline (${guideline} µg/m³) but ${analysis.differenceFromTarget.toFixed(1)} µg/m³ below ${targetName} (${targetValue} µg/m³)`;
}

function generateEnglishParagraph2(data: EZEmissionsParagraph2Data): string {
  // PM2.5 concentration and WHO comparison
  const pm25Concentration = tonnesToConcentration(data.pm25PostPolicy);

  const whoPosition = getWHOTargetDescription(pm25Concentration, 'pm25');
  const pm25Sentence = `PM2.5 concentration fell to ${pm25Concentration.toFixed(1)} µg/m³, ${whoPosition}.`;

  // Fleet composition changes
  const zeroDelta = data.zeroEmissionSharePostPolicy - data.zeroEmissionShareBaseline;
  const nearZeroDelta = data.nearZeroEmissionSharePostPolicy - data.nearZeroEmissionShareBaseline;
  const lowDelta = data.lowEmissionSharePostPolicy - data.lowEmissionShareBaseline;
  const midDelta = data.midEmissionSharePostPolicy - data.midEmissionShareBaseline;
  const highDelta = data.highEmissionSharePostPolicy - data.highEmissionShareBaseline;

  const formatDelta = (delta: number) => `${delta >= 0 ? 'increased' : 'decreased'} ${Math.abs(delta).toFixed(1)} percentage points`;

  const fleetTransition = `Fleet composition shifted across emission tiers: zero-emission vehicles ${formatDelta(zeroDelta)}, near-zero ${formatDelta(nearZeroDelta)}, low-emission ${formatDelta(lowDelta)}, mid-emission ${formatDelta(midDelta)}, and high-emission vehicles ${formatDelta(highDelta)}.`;

  // City benchmarks
  const cityComparison = `London's Ultra Low Emission Zone reached ${CITY_BENCHMARKS.londonULEZ} µg/m³ after two years. Paris' Zone à Faibles Émissions achieved ${CITY_BENCHMARKS.parisZFE} µg/m³.`;

  return `${pm25Sentence} ${fleetTransition} ${cityComparison}`;
}

// FRENCH TEXT GENERATION

const NOMS_CIBLES_INTERMEDIAIRES = {
  pm25: ['Cible intermédiaire 4', 'Cible intermédiaire 3', 'Cible intermédiaire 2', 'Cible intermédiaire 1'],
  pm10: ['Cible intermédiaire 4', 'Cible intermédiaire 3', 'Cible intermédiaire 2', 'Cible intermédiaire 1'],
  no2: ['Cible intermédiaire 2', 'Cible intermédiaire 1']
} as const;

function getDescriptionCibleOMS(valeur: number, polluant: Pollutant): string {
  const analyse = analyzeWHOTarget(valeur, polluant);
  const directive = WHO_GUIDELINES[polluant].guideline;

  if (analyse.meetsGuideline) {
    return `respecte la directive de l'OMS (${directive} µg/m³)`;
  }

  const nomsCibles = NOMS_CIBLES_INTERMEDIAIRES[polluant];
  const indiceCible = analyse.targetIndex;

  if (indiceCible === -1) {
    // Dépasse toutes les cibles
    return `${analyse.differenceFromGuideline.toFixed(1).replace('.', ',')} µg/m³ au-dessus de la directive de l'OMS (${directive} µg/m³), dépasse toutes les cibles intermédiaires`;
  }

  // Respecte une cible intermédiaire
  const valeurCible = WHO_GUIDELINES[polluant].interimTargets[indiceCible];
  const nomCible = nomsCibles[indiceCible];

  if (indiceCible === 0) {
    return `${analyse.differenceFromGuideline.toFixed(1).replace('.', ',')} µg/m³ au-dessus de la directive de l'OMS (${directive} µg/m³) mais respecte la ${nomCible} (${valeurCible} µg/m³)`;
  }

  if (polluant !== 'no2' && indiceCible === 1) {
    return `${analyse.differenceFromGuideline.toFixed(1).replace('.', ',')} µg/m³ au-dessus de la directive de l'OMS (${directive} µg/m³ moyenne annuelle) mais ${analyse.differenceFromTarget.toFixed(1).replace('.', ',')} µg/m³ en dessous de la ${nomCible} (${valeurCible} µg/m³)`;
  }

  return `${analyse.differenceFromGuideline.toFixed(1).replace('.', ',')} µg/m³ au-dessus de la directive de l'OMS (${directive} µg/m³) mais ${analyse.differenceFromTarget.toFixed(1).replace('.', ',')} µg/m³ en dessous de la ${nomCible} (${valeurCible} µg/m³)`;
}

function generateFrenchParagraph2(data: EZEmissionsParagraph2Data): string {
  // Concentration de PM2.5 et comparaison avec l'OMS
  const concentrationPM25 = tonnesToConcentration(data.pm25PostPolicy);

  const positionOMS = getDescriptionCibleOMS(concentrationPM25, 'pm25');
  const phrasePM25 = `La concentration de PM2,5 a chuté à ${concentrationPM25.toFixed(1).replace('.', ',')} µg/m³, ${positionOMS}.`;

  // Changements dans la composition du parc
  const deltaZero = data.zeroEmissionSharePostPolicy - data.zeroEmissionShareBaseline;
  const deltaProcheZero = data.nearZeroEmissionSharePostPolicy - data.nearZeroEmissionShareBaseline;
  const deltaFaible = data.lowEmissionSharePostPolicy - data.lowEmissionShareBaseline;
  const deltaMoyen = data.midEmissionSharePostPolicy - data.midEmissionShareBaseline;
  const deltaEleve = data.highEmissionSharePostPolicy - data.highEmissionShareBaseline;

  const formatDelta = (delta: number) => `${delta >= 0 ? 'ont augmenté' : 'ont diminué'} de ${Math.abs(delta).toFixed(1).replace('.', ',')} points de pourcentage`;

  const transitionParc = `La composition du parc a évolué selon les niveaux d'émissions\u00A0: les véhicules zéro émission ${formatDelta(deltaZero)}, les quasi-zéro ${formatDelta(deltaProcheZero)}, les faibles émissions ${formatDelta(deltaFaible)}, les émissions moyennes ${formatDelta(deltaMoyen)} et les véhicules à fortes émissions ${formatDelta(deltaEleve)}.`;

  // Comparaison avec d'autres villes
  const comparaisonVilles = `La zone à très faibles émissions de Londres a atteint ${CITY_BENCHMARKS.londonULEZ} µg/m³ après deux ans. La Zone à Faibles Émissions de Paris a atteint ${CITY_BENCHMARKS.parisZFE} µg/m³.`;

  return `${phrasePM25} ${transitionParc} ${comparaisonVilles}`;
}

/**
 * Emissions Paragraph 2 - PM2.5 concentration and vehicle fleet composition
 * SSE Message: data_text_paragraph2_emissions
 */
export const EmissionsParagraph2 = () => {
  const { i18n, t } = useTranslation('ez-output');
  const paragraph2Data = useEZOutputEmissionsStore((state) => state.emissionsParagraph2Data);
  const paragraph2State = useEZOutputEmissionsStore((state) => state.emissionsParagraph2State);
  const paragraph2Error = useEZOutputEmissionsStore((state) => state.emissionsParagraph2Error);
  const requestId = useEZSessionStore((state) => state.requestId);

  const handleRetry = async () => {
    if (requestId) {
      await retryComponentData(requestId, 'text_paragraph2_emissions');
    }
  };

  if (paragraph2Error) {
    return (
      <Alert
        message={t('paragraphs.emissions2Error')}
        description={paragraph2Error}
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

  if (paragraph2State === 'inactive' || paragraph2State === 'loading' || !paragraph2Data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <Spin size="small" />
      </div>
    );
  }

  const paragraphText = i18n.language === 'fr'
    ? generateFrenchParagraph2(paragraph2Data)
    : generateEnglishParagraph2(paragraph2Data);

  return (
    <p className={outputStyles.smallParagraph}>
      <HighlightedText text={paragraphText} />
    </p>
  );
};
