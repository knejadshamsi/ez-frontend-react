import { Spin, Alert, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { useEZOutputEmissionsStore } from '~stores/output';
import { useEZSessionStore } from '~stores/session';
import { retryComponentData } from '~ez/api';
import { SmartNumber, Sentence } from '../components';
import outputStyles from '../Output.module.less';
import './locales';

/**
 * CO2 Warm vs Cold paragraph - leads the emissions section
 * SSE Message: data_warm_cold_intensity_emissions
 */
export const WarmColdIntensity = () => {
  const { t, i18n } = useTranslation('ez-output-charts');
  const data = useEZOutputEmissionsStore((state) => state.emissionsWarmColdIntensityData);
  const componentState = useEZOutputEmissionsStore((state) => state.emissionsWarmColdIntensityState);
  const error = useEZOutputEmissionsStore((state) => state.emissionsWarmColdIntensityError);
  const requestId = useEZSessionStore((state) => state.requestId);

  const handleRetry = async () => {
    if (requestId) {
      await retryComponentData(requestId, 'warm_cold_intensity_emissions');
    }
  };

  if (error) {
    return (
      <Alert
        message={t('warmColdIntensity.error')}
        description={error}
        type="error"
        showIcon
        className={outputStyles.sectionErrorAlert}
        action={
          <Button size="small" danger onClick={handleRetry}>
            {t('warmColdIntensity.retry')}
          </Button>
        }
      />
    );
  }

  if (componentState === 'inactive' || componentState === 'loading' || !data) {
    return (
      <div className={outputStyles.paragraphSpinnerContainer}>
        <Spin size="small" />
      </div>
    );
  }

  const isFr = i18n.language === 'fr';
  const { warmCold, intensity } = data;

  const totalBaseline = warmCold.warmBaseline + warmCold.coldBaseline;
  const totalPolicy = warmCold.warmPolicy + warmCold.coldPolicy;
  const hasEmissions = totalBaseline > 0 || totalPolicy > 0;

  if (!hasEmissions) {
    return (
      <p className={outputStyles.smallParagraph}>
        {t('warmColdIntensity.noEmissions')}
      </p>
    );
  }

  const warmBaselinePct = totalBaseline > 0 ? (warmCold.warmBaseline / totalBaseline) * 100 : 0;
  const warmPolicyPct = totalPolicy > 0 ? (warmCold.warmPolicy / totalPolicy) * 100 : 0;
  const intensityDelta = intensity.co2PerMeterPolicy - intensity.co2PerMeterBaseline;
  const intensityIncreased = intensityDelta > 0;

  return (
    <div className={outputStyles.contentParagraph}>
      <p>
        {isFr ? (
          <Sentence>
            Les emissions chaudes de CO{'\u2082'} representent
            <SmartNumber value={warmBaselinePct} unitType="percent" decimals={1} /> des emissions de reference et
            <SmartNumber value={warmPolicyPct} unitType="percent" decimals={1} /> apres politique -
            les emissions chaudes dominent largement.
            L'intensite de CO{'\u2082'} par metre a {intensityIncreased ? 'augmente' : 'diminue'} de
            <SmartNumber value={intensity.co2PerMeterBaseline} unitType="count" decimals={3} /> a
            <SmartNumber value={intensity.co2PerMeterPolicy} unitType="count" decimals={3} /> g/m,
            sur une distance de
            <SmartNumber value={intensity.distanceBaseline} unitType="distance" /> (reference) et
            <SmartNumber value={intensity.distancePolicy} unitType="distance" /> (politique).
          </Sentence>
        ) : (
          <Sentence>
            Warm CO{'\u2082'} emissions account for
            <SmartNumber value={warmBaselinePct} unitType="percent" decimals={1} /> of baseline emissions and
            <SmartNumber value={warmPolicyPct} unitType="percent" decimals={1} /> post-policy -
            warm emissions dominate by a wide margin.
            CO{'\u2082'} intensity per meter {intensityIncreased ? 'increased' : 'decreased'} from
            <SmartNumber value={intensity.co2PerMeterBaseline} unitType="count" decimals={3} /> to
            <SmartNumber value={intensity.co2PerMeterPolicy} unitType="count" decimals={3} /> g/m,
            over a distance of
            <SmartNumber value={intensity.distanceBaseline} unitType="distance" /> (baseline) and
            <SmartNumber value={intensity.distancePolicy} unitType="distance" /> (policy).
          </Sentence>
        )}
      </p>
    </div>
  );
};
