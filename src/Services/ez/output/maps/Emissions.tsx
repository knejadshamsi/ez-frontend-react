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

// Interactive emissions map with scenario toggle, visualization toggle, and private/all toggle
// Pollutant is controlled by the shared toggle in the parent (index.tsx)
export const Emissions = () => {
  const { t } = useTranslation('ez-output-maps');
  const state = useEZOutputMapStore((s) => s.emissionsMapState);
  const error = useEZOutputMapStore((s) => s.emissionsMapError);

  const setState = useEZOutputMapStore((s) => s.setEmissionsMapState);
  const setError = useEZOutputMapStore((s) => s.setEmissionsMapError);

  const visualizationType = useEZOutputFiltersStore((s) => s.selectedVisualizationType);
  const selectedScenario = useEZOutputFiltersStore((s) => s.selectedEmissionsScenario);
  const emissionsViewMode = useEZOutputFiltersStore((s) => s.emissionsViewMode);
  const isMapVisible = useEZOutputFiltersStore((s) => s.isEmissionsMapVisible);

  const setVisualizationType = useEZOutputFiltersStore((s) => s.setSelectedVisualizationType);
  const setSelectedScenario = useEZOutputFiltersStore((s) => s.setSelectedEmissionsScenario);
  const setEmissionsViewMode = useEZOutputFiltersStore((s) => s.setEmissionsViewMode);
  const toggleMapVisibility = useEZOutputFiltersStore((s) => s.toggleEmissionsMapVisibility);

  const isDemoMode = !useEZServiceStore((s) => s.isEzBackendAlive);

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
      <div className={outputStyles.spinnerContainer}>
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
            {t('emissions.controls.scenario')}
          </label>
          <Radio.Group
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value)}
            size="small"
          >
            <Radio.Button value="baseline">{t('emissions.scenarios.baseline')}</Radio.Button>
            <Radio.Button value="policy">{t('emissions.scenarios.policy')}</Radio.Button>
          </Radio.Group>
        </div>

        <div className={outputStyles.controlGroup}>
          <label className={outputStyles.controlLabel}>
            {t('emissions.controls.viewMode')}
          </label>
          <Radio.Group
            value={emissionsViewMode}
            onChange={(e) => setEmissionsViewMode(e.target.value)}
            size="small"
          >
            <Radio.Button value="private">{t('emissions.viewModes.private')}</Radio.Button>
            <Radio.Button value="all">{t('emissions.viewModes.all')}</Radio.Button>
          </Radio.Group>
        </div>

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
      </div>
    </MapContainer>
  );
};
