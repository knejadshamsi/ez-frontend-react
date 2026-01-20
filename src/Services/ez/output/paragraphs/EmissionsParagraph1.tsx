import { Spin, Alert, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { useEZOutputEmissionsStore, type EZEmissionsParagraph1Data } from '~stores/output';
import { useEZSessionStore } from '~stores/session';
import { retryComponentData } from '~ez/api';
import {
  calculateComparisonData,
  getParisAgreementProgress,
  PARIS_AGREEMENT_TRANSPORT_REDUCTION,
  type ComparisonData
} from '../utils/calculations';
import { HighlightedText } from '../utils';
import outputStyles from '../Output.module.less';

// ENGLISH TEXT GENERATION

type VerbMode = 'past' | 'present' | 'gerund' | 'noun';
type ModeVerbal = 'passé' | 'présent' | 'gérondif' | 'nom';

const EN_SLIGHT_SYNONYMS = ['slightly', 'marginally', 'modestly', 'somewhat', 'minimally'] as const;
const EN_DRAMATIC_SYNONYMS = ['dramatically', 'significantly', 'substantially', 'considerably', 'markedly', 'sharply', 'greatly', 'massively', 'largely'] as const;

const EN_VERB_CONJUGATIONS = {
  increase: { past: 'increased', present: 'increases', gerund: 'increasing', noun: 'increase' },
  decrease: { past: 'decreased', present: 'decreases', gerund: 'decreasing', noun: 'decrease' },
  stable: { past: 'remained stable', present: 'remains stable', gerund: 'remaining stable', noun: 'stability' }
} as const;

function getRandomSynonym(synonyms: readonly string[]): string {
  return synonyms[Math.floor(Math.random() * synonyms.length)];
}

function getEnglishDescription(comparison: ComparisonData, mode: VerbMode): string {
  const verb = EN_VERB_CONJUGATIONS[comparison.direction][mode];
  if (comparison.magnitude === 'stable') return verb;
  if (comparison.magnitude === 'slight') return `${getRandomSynonym(EN_SLIGHT_SYNONYMS)} ${verb}`;
  if (comparison.magnitude === 'moderate') return verb;
  return `${getRandomSynonym(EN_DRAMATIC_SYNONYMS)} ${verb}`;
}

function generateEnglishText(data: EZEmissionsParagraph1Data): string {
  const co2Comparison = calculateComparisonData(data.co2Baseline, data.co2PostPolicy);
  const percentChange = co2Comparison.percentChange;
  const parisProgress = getParisAgreementProgress(percentChange);

  const co2Sentence = co2Comparison.magnitude === 'stable'
    ? `CO2 emissions ${getEnglishDescription(co2Comparison, 'past')} at approximately ${data.co2Baseline.toLocaleString('en-US')} tonnes daily, with minimal change (${percentChange.toFixed(1)}%).`
    : `CO2 emissions ${getEnglishDescription(co2Comparison, 'past')} by ${percentChange.toFixed(1)}%, from ${data.co2Baseline.toLocaleString('en-US')} to ${data.co2PostPolicy.toLocaleString('en-US')} tonnes daily.`;

  const parisContext = `This achieves ${parisProgress}% of the Paris Agreement transport reduction pathway (${(PARIS_AGREEMENT_TRANSPORT_REDUCTION * 100).toFixed(0)}% by 2050 to limit warming to 1.5°C).`;
  const modeShiftContext = `The reduction came from mode shift affecting ${data.modeShiftPercentage.toFixed(0)}% of car trips.`;

  return `${co2Sentence} ${parisContext} ${modeShiftContext}`;
}

// FRENCH TEXT GENERATION

const FR_SLIGHT_SYNONYMS = ['légèrement', 'marginalement', 'modestement', 'quelque peu', 'faiblement'] as const;
const FR_DRAMATIC_SYNONYMS = ['considérablement', 'substantiellement', 'fortement', 'nettement', 'largement', 'massivement', 'grandement'] as const;

const FR_VERB_CONJUGATIONS = {
  increase: { passé: 'ont augmenté', présent: 'augmentent', gérondif: 'augmentant', nom: 'augmentation' },
  decrease: { passé: 'ont diminué', présent: 'diminuent', gérondif: 'diminuant', nom: 'diminution' },
  stable: { passé: 'sont demeurées stables', présent: 'demeurent stables', gérondif: 'demeurant stables', nom: 'stabilité' }
} as const;

function getFrenchDescription(comparaison: ComparisonData, mode: ModeVerbal): string {
  const verbe = FR_VERB_CONJUGATIONS[comparaison.direction][mode];
  if (comparaison.magnitude === 'stable') return verbe;
  if (comparaison.magnitude === 'slight') return `${verbe} ${getRandomSynonym(FR_SLIGHT_SYNONYMS)}`;
  if (comparaison.magnitude === 'moderate') return verbe;
  return `${verbe} ${getRandomSynonym(FR_DRAMATIC_SYNONYMS)}`;
}

function generateFrenchText(data: EZEmissionsParagraph1Data): string {
  const comparaisonCO2 = calculateComparisonData(data.co2Baseline, data.co2PostPolicy);
  const pourcentageChangement = comparaisonCO2.percentChange;
  const progressionParis = getParisAgreementProgress(pourcentageChangement);

  const phraseCO2 = comparaisonCO2.magnitude === 'stable'
    ? `Les émissions de CO2 ${getFrenchDescription(comparaisonCO2, 'passé')} à environ ${data.co2Baseline.toLocaleString('fr-CA')} tonnes par jour, avec un changement minimal (${pourcentageChangement.toFixed(1).replace('.', ',')} %).`
    : `Les émissions de CO2 ${getFrenchDescription(comparaisonCO2, 'passé')} de ${pourcentageChangement.toFixed(1).replace('.', ',')} %, passant de ${data.co2Baseline.toLocaleString('fr-CA')} à ${data.co2PostPolicy.toLocaleString('fr-CA')} tonnes par jour.`;

  const contexteParis = `Cela permet d'atteindre ${progressionParis} % de l'objectif de réduction des transports de l'Accord de Paris (${(PARIS_AGREEMENT_TRANSPORT_REDUCTION * 100).toFixed(0)} % d'ici 2050 pour limiter le réchauffement à 1,5 °C).`;
  const contexteTransfertModal = `Cette réduction provient d'un transfert modal touchant ${data.modeShiftPercentage.toFixed(0)} % des déplacements en voiture.`;

  return `${phraseCO2} ${contexteParis} ${contexteTransfertModal}`;
}

/**
 * Emissions Paragraph 1 - CO2 reduction and Paris Agreement context
 * SSE Message: data_text_paragraph1_emissions
 */
export const EmissionsParagraph1 = () => {
  const { i18n, t } = useTranslation('ez-output');
  const paragraph1Data = useEZOutputEmissionsStore((state) => state.emissionsParagraph1Data);
  const paragraph1State = useEZOutputEmissionsStore((state) => state.emissionsParagraph1State);
  const paragraph1Error = useEZOutputEmissionsStore((state) => state.emissionsParagraph1Error);
  const requestId = useEZSessionStore((state) => state.requestId);

  const handleRetry = async () => {
    if (requestId) {
      await retryComponentData(requestId, 'text_paragraph1_emissions');
    }
  };

  if (paragraph1Error) {
    return (
      <Alert
        message={t('paragraphs.emissions1Error')}
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
    ? generateFrenchText(paragraph1Data)
    : generateEnglishText(paragraph1Data);

  return (
    <p className={outputStyles.contentParagraph}>
      <HighlightedText text={paragraphText} />
    </p>
  );
};
