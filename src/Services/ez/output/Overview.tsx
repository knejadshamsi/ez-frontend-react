import { Spin, Alert, Button, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useEZOutputOverviewStore } from '~stores/output';
import { useEZSessionStore, useEZOutputFiltersStore } from '~stores/session';
import { useEZServiceStore, useAPIPayloadStore } from '~store';
import { retryComponentData } from '~ez/api';
import { CopyRequestIdButton } from '../components/CopyRequestIdButton';
import { InputLayerToggleButton } from './InputLayerToggleButton';
import { SmartNumber, Sentence } from './components';
import outputStyles from './Output.module.less';
import './locales';

/**
 * Overview component - displays simulation summary statistics
 * SSE Message: data_text_overview
 */
export const Overview = () => {
  const { t } = useTranslation('ez-output');
  const [messageApi, contextHolder] = message.useMessage();
  const overviewData = useEZOutputOverviewStore((state) => state.overviewData);
  const overviewState = useEZOutputOverviewStore((state) => state.overviewState);
  const overviewError = useEZOutputOverviewStore((state) => state.overviewError);
  const requestId = useEZSessionStore((state) => state.requestId);
  const isEzBackendAlive = useEZServiceStore((state) => state.isEzBackendAlive);

  const inputZoneLayerOpacity = useEZOutputFiltersStore((state) => state.inputZoneLayerOpacity);
  const inputSimulationAreaLayerOpacity = useEZOutputFiltersStore((state) => state.inputSimulationAreaLayerOpacity);
  const cycleZoneOpacity = useEZOutputFiltersStore((state) => state.cycleInputZoneLayerOpacity);
  const cycleAreaOpacity = useEZOutputFiltersStore((state) => state.cycleInputSimulationAreaLayerOpacity);

  const customSimulationAreas = useAPIPayloadStore((state) => state.payload.customSimulationAreas);
  const scaledSimulationAreas = useAPIPayloadStore((state) => state.payload.scaledSimulationAreas);

  const hasSimulationAreas =
    customSimulationAreas.some(area => area.coords !== null) ||
    scaledSimulationAreas.some(area => area.coords && area.coords.length > 0);

  const handleRetry = async () => {
    if (requestId) {
      await retryComponentData(requestId, 'text_overview');
    }
  };

  if (overviewError) {
    return (
      <div className={outputStyles.contentWrapper}>
        <Alert
          message={t('overview.error')}
          description={overviewError}
          type="error"
          showIcon
          className={outputStyles.sectionErrorAlert}
          action={
            <Button size="small" danger onClick={handleRetry}>
              {t('overview.retry')}
            </Button>
          }
        />
      </div>
    );
  }

  if (overviewState === 'inactive' || overviewState === 'loading' || !overviewData) {
    return (
      <div className={`${outputStyles.contentWrapper} ${outputStyles.overviewLoadingContainer}`}>
        <Spin size="large" tip={t('overview.loadingTip')} />
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <div className={outputStyles.titleContainer}>
        <h1 className={outputStyles.title}>{t('overview.title')}</h1>
        <div className={outputStyles.titleButtonGroup}>
          {hasSimulationAreas && (
            <InputLayerToggleButton
              layerType="area"
              opacityState={inputSimulationAreaLayerOpacity}
              onCycle={cycleAreaOpacity}
              className={outputStyles.layerToggleButton}
            />
          )}
          <InputLayerToggleButton
            layerType="zone"
            opacityState={inputZoneLayerOpacity}
            onCycle={cycleZoneOpacity}
            className={outputStyles.layerToggleButton}
          />
          {isEzBackendAlive && requestId && (
            <CopyRequestIdButton
              requestId={requestId}
              showText={true}
              text="ID"
              size="small"
              type="default"
              ghost={true}
              messageApi={messageApi}
              className={outputStyles.copyButton}
            />
          )}
        </div>
      </div>
      <p className={outputStyles.description}>
        <Sentence>
          {t('overview.descriptionPre')} <SmartNumber value={overviewData.personCount} unitType="count" />
          {t('overview.descriptionPeople')} <SmartNumber value={overviewData.legCount} unitType="count" />
          {t('overview.descriptionLegs')}
          <SmartNumber value={overviewData.totalAreaCoverageKm2} unitType="area" /> {t('overview.descriptionNetwork')}
          <SmartNumber value={overviewData.totalNetworkNodes} unitType="count" /> {t('overview.descriptionNodes')}
          <SmartNumber value={overviewData.totalNetworkLinks} unitType="count" /> {t('overview.descriptionLinks')}
          <SmartNumber value={overviewData.totalKmTraveled} unitType="distance" />
          {t('overview.descriptionPost')} ({overviewData.samplePercentage}% {t('overview.descriptionSample')}).
        </Sentence>
      </p>
    </>
  );
};
