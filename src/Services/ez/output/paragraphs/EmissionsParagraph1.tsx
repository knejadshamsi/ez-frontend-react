import { Spin, Alert, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { useEZOutputEmissionsStore } from '~stores/output';
import { useEZSessionStore } from '~stores/session';
import { retryComponentData } from '~ez/api';
import { SmartNumber, Trend, Sentence } from '../components';
import type { TrendDirection, TrendMagnitude } from '../components/types';
import outputStyles from '../Output.module.less';

const NEGLIGIBLE_THRESHOLD = 0.1;

function getTrendFromDelta(delta: number): { direction: TrendDirection; magnitude: TrendMagnitude } {
  const abs = Math.abs(delta);
  if (abs < NEGLIGIBLE_THRESHOLD) return { direction: 'stable', magnitude: 'stable' };
  const direction: TrendDirection = delta > 0 ? 'increase' : 'decrease';
  if (abs < 1) return { direction, magnitude: 'slight' };
  if (abs < 10) return { direction, magnitude: 'moderate' };
  return { direction, magnitude: 'dramatic' };
}

interface PollutantRow {
  label: string;
  baseline: number;
  policy: number;
  delta: number;
}

/**
 * Emissions Paragraph 1 - private vehicle emissions as headline, transit as context
 * SSE Message: data_text_paragraph1_emissions
 */
export const EmissionsParagraph1 = () => {
  const { i18n, t } = useTranslation('ez-output');
  const d = useEZOutputEmissionsStore((state) => state.emissionsParagraph1Data);
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

  if (paragraph1State === 'inactive' || paragraph1State === 'loading' || !d) {
    return (
      <div className={outputStyles.paragraphSpinnerContainer}>
        <Spin size="small" />
      </div>
    );
  }

  const isFr = i18n.language === 'fr';

  const pollutants: PollutantRow[] = [
    { label: 'CO\u2082', baseline: d.privateCo2Baseline, policy: d.privateCo2Policy, delta: d.privateCo2DeltaPercent },
    { label: 'NOx', baseline: d.privateNoxBaseline, policy: d.privateNoxPolicy, delta: d.privateNoxDeltaPercent },
    { label: 'PM2.5', baseline: d.privatePm25Baseline, policy: d.privatePm25Policy, delta: d.privatePm25DeltaPercent },
    { label: 'PM10', baseline: d.privatePm10Baseline, policy: d.privatePm10Policy, delta: d.privatePm10DeltaPercent },
  ];

  const transitCo2 = d.transitCo2Baseline;

  if (isFr) {
    return (
      <div className={outputStyles.contentParagraph}>
        <p>
          {pollutants.map((p, i) => {
            const trend = getTrendFromDelta(p.delta);
            const isNegligible = Math.abs(p.delta) < NEGLIGIBLE_THRESHOLD;
            return (
              <span key={p.label}>
                {i > 0 && ' '}
                {isNegligible ? (
                  <Sentence>
                    Les emissions de {p.label} des vehicules prives sont demeurees essentiellement inchangees a environ
                    <SmartNumber value={p.baseline} unitType="mass" />.
                  </Sentence>
                ) : (
                  <Sentence>
                    Les emissions de {p.label} des vehicules prives ont
                    <Trend direction={trend.direction} magnitude={trend.magnitude} />
                    de <SmartNumber value={Math.abs(p.delta)} unitType="percent" decimals={1} />,
                    passant de <SmartNumber value={p.baseline} unitType="mass" />
                    a <SmartNumber value={p.policy} unitType="mass" />.
                  </Sentence>
                )}
              </span>
            );
          })}
          {' '}
          <Sentence>
            Pour contexte, les emissions de CO{'\u2082'} du reseau de transport en commun totalisent
            <SmartNumber value={transitCo2} unitType="mass" /> et ne sont pas affectees par la politique de zone.
          </Sentence>
        </p>
      </div>
    );
  }

  return (
    <div className={outputStyles.contentParagraph}>
      <p>
        {pollutants.map((p, i) => {
          const trend = getTrendFromDelta(p.delta);
          const isNegligible = Math.abs(p.delta) < NEGLIGIBLE_THRESHOLD;
          return (
            <span key={p.label}>
              {i > 0 && ' '}
              {isNegligible ? (
                <Sentence>
                  Private vehicle {p.label} emissions remained essentially unchanged at approximately
                  <SmartNumber value={p.baseline} unitType="mass" />.
                </Sentence>
              ) : (
                <Sentence>
                  Private vehicle {p.label} emissions
                  <Trend direction={trend.direction} magnitude={trend.magnitude} />
                  by <SmartNumber value={Math.abs(p.delta)} unitType="percent" decimals={1} />,
                  from <SmartNumber value={p.baseline} unitType="mass" />
                  to <SmartNumber value={p.policy} unitType="mass" />.
                </Sentence>
              )}
            </span>
          );
        })}
        {' '}
        <Sentence>
          For context, transit network CO{'\u2082'} emissions total
          <SmartNumber value={transitCo2} unitType="mass" /> and are unaffected by the zone policy.
        </Sentence>
      </p>
    </div>
  );
};
