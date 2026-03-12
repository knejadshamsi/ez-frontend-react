import { Spin, Alert, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { useEZOutputTripLegsStore } from '~stores/output';
import { useEZSessionStore } from '~stores/session';
import { retryComponentData } from '~ez/api';
import { SmartNumber, Sentence } from '../components';
import outputStyles from '../Output.module.less';

/**
 * Trip Performance Paragraph - conclusion-style summary of net impacts
 * SSE Message: data_text_paragraph1_trip_legs
 */
export const TripPerformanceParagraph = () => {
  const { i18n, t } = useTranslation('ez-output');
  const data = useEZOutputTripLegsStore((state) => state.tripLegsParagraphData);
  const componentState = useEZOutputTripLegsStore((state) => state.tripLegsParagraphState);
  const error = useEZOutputTripLegsStore((state) => state.tripLegsParagraphError);
  const requestId = useEZSessionStore((state) => state.requestId);

  const handleRetry = async () => {
    if (requestId) {
      await retryComponentData(requestId, 'text_paragraph1_trip_legs');
    }
  };

  if (error) {
    return (
      <Alert
        message={t('paragraphs.tripPerformanceError')}
        description={error}
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

  if (componentState === 'inactive' || componentState === 'loading' || !data) {
    return (
      <div className={outputStyles.paragraphSpinnerContainer}>
        <Spin size="small" />
      </div>
    );
  }

  const isFr = i18n.language === 'fr';

  if (data.changedTrips === 0) {
    return (
      <div className={outputStyles.contentParagraph}>
        <p>
          {isFr
            ? 'La politique n\'a eu aucun impact mesurable sur la performance individuelle des deplacements.'
            : 'The policy had no measurable impact on individual trip performance.'}
        </p>
      </div>
    );
  }

  const netCo2Positive = data.netCo2DeltaGrams > 0;
  const netTimePositive = data.netTimeDeltaMinutes > 0;

  if (isFr) {
    return (
      <div className={outputStyles.contentParagraph}>
        <p>
          <Sentence>
            Sur <SmartNumber value={data.totalTrips} unitType="count" decimals={0} /> deplacements,
            <SmartNumber value={data.changedTrips} unitType="count" decimals={0} /> ont ete affectes par la politique.
          </Sentence>
          {' '}
          <Sentence>
            L'impact net sur le reseau est de {netCo2Positive ? '+' : ''}<SmartNumber value={data.netCo2DeltaGrams} unitType="mass" /> de CO{'\u2082'}
            et {netTimePositive ? '+' : ''}<SmartNumber value={data.netTimeDeltaMinutes} unitType="time" decimals={1} /> de temps de deplacement,
            avec une variation moyenne de {netCo2Positive ? '+' : ''}<SmartNumber value={data.avgCo2DeltaGrams} unitType="mass" /> de CO{'\u2082'}
            et {netTimePositive ? '+' : ''}<SmartNumber value={data.avgTimeDeltaMinutes} unitType="time" decimals={1} /> par deplacement affecte.
          </Sentence>
        </p>
      </div>
    );
  }

  return (
    <div className={outputStyles.contentParagraph}>
      <p>
        <Sentence>
          Of <SmartNumber value={data.totalTrips} unitType="count" decimals={0} /> trips,
          <SmartNumber value={data.changedTrips} unitType="count" decimals={0} /> were affected by the policy.
        </Sentence>
        {' '}
        <Sentence>
          The net impact across the network is {netCo2Positive ? '+' : ''}<SmartNumber value={data.netCo2DeltaGrams} unitType="mass" /> of CO{'\u2082'}
          and {netTimePositive ? '+' : ''}<SmartNumber value={data.netTimeDeltaMinutes} unitType="time" decimals={1} /> of travel time,
          with an average change of {netCo2Positive ? '+' : ''}<SmartNumber value={data.avgCo2DeltaGrams} unitType="mass" /> of CO{'\u2082'}
          and {netTimePositive ? '+' : ''}<SmartNumber value={data.avgTimeDeltaMinutes} unitType="time" decimals={1} /> per affected trip.
        </Sentence>
      </p>
    </div>
  );
};
