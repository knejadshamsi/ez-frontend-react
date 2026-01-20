import { Spin, Alert, Button, message } from 'antd';
import { useTranslation, Trans } from 'react-i18next';
import { useEZOutputOverviewStore } from '~stores/output';
import { useEZSessionStore, useEZOutputFiltersStore } from '~stores/session';
import { useEZServiceStore, useAPIPayloadStore } from '~store';
import { retryComponentData } from '~ez/api';
import { CopyRequestIdButton } from '../components/CopyRequestIdButton';
import { InputLayerToggleButton } from './InputLayerToggleButton';
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
      <div className={outputStyles.contentWrapper} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
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
        <Trans
          i18nKey="overview.description"
          ns="ez-output"
          values={{
            totalPersonCount: overviewData.totalPersonCount.toLocaleString(),
            totalLegCount: overviewData.totalLegCount.toLocaleString(),
            totalAreaCoverageKm2: overviewData.totalAreaCoverageKm2,
            totalNetworkNodes: overviewData.totalNetworkNodes.toLocaleString(),
            totalNetworkLinks: overviewData.totalNetworkLinks.toLocaleString(),
            totalKilometersTraveled: overviewData.totalKilometersTraveled.toLocaleString(),
          }}
          components={{
            strong: <span className={outputStyles.highlightedNumber} />,
          }}
        />
      </p>
    </>
  );
};
