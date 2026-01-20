import { Spin, Alert, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  useEZOutputPeopleResponseStore,
  type EZPeopleResponseParagraph1Data,
  type EZPeopleResponseParagraph2Data
} from '~stores/output';
import { useEZSessionStore } from '~stores/session';
import { retryComponentData } from '~ez/api';
import {
  MARCHETTI_CONSTANT,
  ELASTICITY_THRESHOLDS,
  REROUTING_THRESHOLDS
} from '../utils/calculations';
import { HighlightedText } from '../utils';
import outputStyles from '../Output.module.less';

// ENGLISH TEXT GENERATION

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

function generateEnglishParagraph2(
  paragraph1Data: EZPeopleResponseParagraph1Data,
  paragraph2Data: EZPeopleResponseParagraph2Data
): string {
  const sentences: string[] = [];

  // Modal shift time analysis
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

  // Rerouting analysis
  const reroutingAnalysis = interpretReroutingImpact(
    paragraph1Data.reroutedPercentage,
    paragraph2Data.averageTimeRerouted
  );
  if (reroutingAnalysis) {
    sentences.push(reroutingAnalysis);
  }

  // Elasticity analysis
  const elasticityAnalysis = analyzeElasticity(paragraph1Data.cancelledTripPercentage);
  sentences.push(elasticityAnalysis);

  return sentences.join(' ');
}

// FRENCH TEXT GENERATION

function interpreterImpactDetournement(pctDetourne: number, tempsDetourne: number): string {
  if (pctDetourne < 5) {
    return '';
  }

  if (tempsDetourne < REROUTING_THRESHOLDS.TIME_SAVINGS) {
    return `Le détournement a permis d'économiser en moyenne ${Math.abs(tempsDetourne).toFixed(1).replace('.', ',')} minutes, révélant que la zone était auparavant un point de congestion.`;
  } else if (tempsDetourne > REROUTING_THRESHOLDS.TIME_PENALTY) {
    return `Le détournement a ajouté en moyenne ${tempsDetourne.toFixed(1).replace('.', ',')} minutes, indiquant une capacité limitée de routes alternatives.`;
  } else {
    return `Le détournement a eu un impact minimal sur le temps (${tempsDetourne >= 0 ? '+' : ''}${tempsDetourne.toFixed(1).replace('.', ',')} minutes), suggérant des routes alternatives adéquates.`;
  }
}

function analyserElasticite(pctAnnule: number): string {
  if (pctAnnule < ELASTICITY_THRESHOLDS.LOW) {
    return `Les annulations de déplacements sont demeurées faibles (${pctAnnule.toFixed(1).replace('.', ',')} %), indiquant une demande inélastique—la plupart des déplacements étaient essentiels et inévitables.`;
  } else if (pctAnnule < ELASTICITY_THRESHOLDS.MODERATE) {
    return `Des annulations modérées de déplacements (${pctAnnule.toFixed(1).replace('.', ',')} %) suggèrent un mélange de déplacements essentiels et discrétionnaires.`;
  } else {
    return `Des annulations élevées de déplacements (${pctAnnule.toFixed(1).replace('.', ',')} %) indiquent une demande élastique—plusieurs déplacements étaient discrétionnaires et facilement évitables.`;
  }
}

function generateFrenchParagraph2(
  donneesP1: EZPeopleResponseParagraph1Data,
  donneesP2: EZPeopleResponseParagraph2Data
): string {
  const phrases: string[] = [];

  // Analyse du temps de transfert modal
  const tempsTransfertModal = [
    { mode: 'autobus', pct: donneesP1.switchedToBusPercentage, temps: donneesP2.averageTimeSwitchedToBus },
    { mode: 'métro', pct: donneesP1.switchedToSubwayPercentage, temps: donneesP2.averageTimeSwitchedToSubway },
    { mode: 'marche', pct: donneesP1.switchedToWalkingPercentage, temps: donneesP2.averageTimeSwitchedToWalking },
    { mode: 'vélo', pct: donneesP1.switchedToBikingPercentage, temps: donneesP2.averageTimeSwitchedToBiking }
  ].filter(m => m.pct > 0);

  if (tempsTransfertModal.length > 0) {
    const temps = tempsTransfertModal.map(m => m.temps);
    const tempsMin = Math.min(...temps);
    const tempsMax = Math.max(...temps);

    const pctMin = (Math.abs(tempsMin) / MARCHETTI_CONSTANT * 100).toFixed(0);
    const pctMax = (Math.abs(tempsMax) / MARCHETTI_CONSTANT * 100).toFixed(0);

    if (tempsMin < 0 && tempsMax < 0) {
      phrases.push(`Les personnes ayant opté pour un transfert modal ont économisé ${Math.abs(tempsMax).toFixed(0)}-${Math.abs(tempsMin).toFixed(0)} minutes (${pctMin}-${pctMax} % du budget de déplacement Marchetti de ${MARCHETTI_CONSTANT} minutes), suggérant que le transport en commun et les modes actifs étaient déjà compétitifs.`);
    } else if (tempsMin >= 0 && tempsMax >= 0) {
      phrases.push(`Les personnes ayant opté pour un transfert modal ont subi des pénalités de temps de ${tempsMin.toFixed(0)}-${tempsMax.toFixed(0)} minutes (${pctMin}-${pctMax} % du budget de déplacement Marchetti de ${MARCHETTI_CONSTANT} minutes), révélant des lacunes d'infrastructure qui ont réduit la compétitivité du transport en commun.`);
    } else {
      phrases.push(`Les impacts sur le temps ont varié : certains modes ont permis d'économiser jusqu'à ${Math.abs(tempsMin).toFixed(0)} minutes tandis que d'autres ont ajouté ${tempsMax.toFixed(0)} minutes (${pctMin}-${pctMax} % du budget de déplacement Marchetti de ${MARCHETTI_CONSTANT} minutes), indiquant une couverture inégale du transport en commun.`);
    }
  }

  // Analyse du détournement
  const analyseDetournement = interpreterImpactDetournement(
    donneesP1.reroutedPercentage,
    donneesP2.averageTimeRerouted
  );
  if (analyseDetournement) {
    phrases.push(analyseDetournement);
  }

  // Analyse de l'élasticité
  const analyseElasticite = analyserElasticite(donneesP1.cancelledTripPercentage);
  phrases.push(analyseElasticite);

  return phrases.join(' ');
}

/**
 * People Response Paragraph 2 - time impacts and elasticity
 * SSE Message: data_text_paragraph2_people_response
 */
export const PeopleResponseParagraph2 = () => {
  const { i18n, t } = useTranslation('ez-output');
  const paragraph1Data = useEZOutputPeopleResponseStore((state) => state.peopleResponseParagraph1Data);
  const paragraph2Data = useEZOutputPeopleResponseStore((state) => state.peopleResponseParagraph2Data);
  const paragraph2State = useEZOutputPeopleResponseStore((state) => state.peopleResponseParagraph2State);
  const paragraph2Error = useEZOutputPeopleResponseStore((state) => state.peopleResponseParagraph2Error);
  const requestId = useEZSessionStore((state) => state.requestId);

  const handleRetry = async () => {
    if (requestId) {
      await retryComponentData(requestId, 'text_paragraph2_people_response');
    }
  };

  if (paragraph2Error) {
    return (
      <Alert
        message={t('paragraphs.peopleResponse2Error')}
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

  if (paragraph2State === 'inactive' || paragraph2State === 'loading' || !paragraph2Data || !paragraph1Data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <Spin size="small" />
      </div>
    );
  }

  const paragraphText = i18n.language === 'fr'
    ? generateFrenchParagraph2(paragraph1Data, paragraph2Data)
    : generateEnglishParagraph2(paragraph1Data, paragraph2Data);

  return (
    <p className={outputStyles.smallParagraph}>
      <HighlightedText text={paragraphText} />
    </p>
  );
};
