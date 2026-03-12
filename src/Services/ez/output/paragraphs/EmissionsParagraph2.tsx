import { Spin, Alert, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { useEZOutputEmissionsStore } from '~stores/output';
import { useEZSessionStore } from '~stores/session';
import { retryComponentData } from '~ez/api';
import { SmartNumber, Sentence } from '../components';
import outputStyles from '../Output.module.less';

/**
 * Emissions Paragraph 2 - PM2.5 spatial density within the simulation zone
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
      <div className={outputStyles.paragraphSpinnerContainer}>
        <Spin size="small" />
      </div>
    );
  }

  const isFr = i18n.language === 'fr';
  const delta = paragraph2Data.pm25PerKm2Policy - paragraph2Data.pm25PerKm2Baseline;
  const increased = delta > 0;
  const isNegligible = Math.abs(delta) < 0.01;

  if (isFr) {
    return (
      <p className={outputStyles.smallParagraph}>
        <Sentence>
          Dans la zone de simulation de <SmartNumber value={paragraph2Data.zoneAreaKm2} unitType="area" />,
          {isNegligible ? (
            <> la densite de PM2,5 des vehicules prives est demeuree essentiellement inchangee a environ
            <SmartNumber value={paragraph2Data.pm25PerKm2Baseline} unitType="count" decimals={2} /> g/km².</>
          ) : (
            <> la densite de PM2,5 des vehicules prives a {increased ? 'augmente' : 'diminue'} de
            <SmartNumber value={paragraph2Data.pm25PerKm2Baseline} unitType="count" decimals={2} /> a
            <SmartNumber value={paragraph2Data.pm25PerKm2Policy} unitType="count" decimals={2} /> g/km².</>
          )}
        </Sentence>
      </p>
    );
  }

  return (
    <p className={outputStyles.smallParagraph}>
      <Sentence>
        Within the <SmartNumber value={paragraph2Data.zoneAreaKm2} unitType="area" /> simulation zone,
        {isNegligible ? (
          <> Private vehicle PM2.5 density remained essentially unchanged at approximately
          <SmartNumber value={paragraph2Data.pm25PerKm2Baseline} unitType="count" decimals={2} /> g/km².</>
        ) : (
          <> Private vehicle PM2.5 density {increased ? 'increased' : 'decreased'} from
          <SmartNumber value={paragraph2Data.pm25PerKm2Baseline} unitType="count" decimals={2} /> to
          <SmartNumber value={paragraph2Data.pm25PerKm2Policy} unitType="count" decimals={2} /> g/km².</>
        )}
      </Sentence>
    </p>
  );
};
