import { useEffect } from 'react';
import { Radio, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { useEZOutputMapStore } from '~stores/output';
import { useEZOutputFiltersStore } from '~stores/session';
import { useEZServiceStore } from '~store';
import { fetchMapData } from '~ez/api';
import { MapContainer } from '../utils';
import outputStyles from '../Output.module.less';
import './locales';

// Interactive emissions map with pollutant selector and visualization toggle
export const Emissions = () => {
  const { t } = useTranslation('ez-output-maps');
  const state = useEZOutputMapStore((state) => state.emissionsMapState);
  const error = useEZOutputMapStore((state) => state.emissionsMapError);

  const setState = useEZOutputMapStore((state) => state.setEmissionsMapState);
  const setError = useEZOutputMapStore((state) => state.setEmissionsMapError);

  const visualizationType = useEZOutputFiltersStore((state) => state.selectedVisualizationType);
  const selectedPollutant = useEZOutputFiltersStore((state) => state.selectedPollutantType);
  const isMapVisible = useEZOutputFiltersStore((state) => state.isEmissionsMapVisible);

  const setVisualizationType = useEZOutputFiltersStore((state) => state.setSelectedVisualizationType);
  const setSelectedPollutant = useEZOutputFiltersStore((state) => state.setSelectedPollutantType);
  const toggleMapVisibility = useEZOutputFiltersStore((state) => state.toggleEmissionsMapVisibility);

  const isDemoMode = !useEZServiceStore((state) => state.isEzBackendAlive);

  useEffect(() => {
    if (isMapVisible && state === 'success_initial') {
      fetchMapData('emissions', isDemoMode);
    }
  }, [isMapVisible, state, isDemoMode]);

  const handleRetry = () => {
    setError(null);
    setState('loading');
    fetchMapData('emissions', isDemoMode);
  };

  if (state === 'inactive') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <Spin size="default" tip={t('emissions.loadingTip')} />
      </div>
    );
  }

  return (
    <MapContainer
      title={t('emissions.title')}
      description={t('emissions.description')}
      isShown={isMapVisible}
      onToggle={toggleMapVisibility}
      isLoading={state === 'loading'}
      hasData={state === 'success'}
      error={state === 'error_initial' || state === 'error' ? error : null}
      onRetry={handleRetry}
    >
      <div className={outputStyles.mapControlsContainer}>
        <div className={outputStyles.controlGroup}>
          <label className={outputStyles.controlLabel}>
            {t('emissions.controls.visualizationType')}
          </label>
          <Radio.Group
            value={visualizationType}
            onChange={(e) => setVisualizationType(e.target.value)}
            size="small"
          >
            <Radio.Button value="hexagon">{t('emissions.visualizationTypes.hexagon')}</Radio.Button>
            <Radio.Button value="heatmap">{t('emissions.visualizationTypes.heatmap')}</Radio.Button>
          </Radio.Group>
        </div>

        <div className={outputStyles.controlGroup}>
          <label className={outputStyles.controlLabel}>
            {t('emissions.controls.pollutantType')}
          </label>
          <Radio.Group
            value={selectedPollutant}
            onChange={(e) => setSelectedPollutant(e.target.value)}
            size="small"
          >
            <Radio.Button value="CO2">{t('emissions.pollutants.co2')}</Radio.Button>
            <Radio.Button value="NOx">{t('emissions.pollutants.nox')}</Radio.Button>
            <Radio.Button value="PM2.5">{t('emissions.pollutants.pm25')}</Radio.Button>
            <Radio.Button value="PM10">{t('emissions.pollutants.pm10')}</Radio.Button>
          </Radio.Group>
        </div>
      </div>
    </MapContainer>
  );
};
