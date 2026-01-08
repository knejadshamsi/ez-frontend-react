import { useEffect } from 'react';
import { Radio, Spin } from 'antd';
import { useEZOutputMapStore } from '~stores/output';
import { useEZOutputFiltersStore } from '~stores/session';
import { useEZServiceStore } from '~store';
import { fetchMapData } from '~ez/api';
import { MapContainer } from '../reusables';
import outputStyles from '../Output.module.less';

// Interactive emissions map with pollutant selector and visualization toggle
export const Map = () => {
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
        <Spin size="default" tip="Preparing emissions map..." />
      </div>
    );
  }

  return (
    <MapContainer
      title="Emissions Map Visualization"
      description="Interactive map showing emissions distribution across the network"
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
            Visualization Type
          </label>
          <Radio.Group
            value={visualizationType}
            onChange={(e) => setVisualizationType(e.target.value)}
            size="small"
          >
            <Radio.Button value="hexagon">Hex Layer</Radio.Button>
            <Radio.Button value="heatmap">Heat Map</Radio.Button>
          </Radio.Group>
        </div>

        <div className={outputStyles.controlGroup}>
          <label className={outputStyles.controlLabel}>
            Pollutant Type
          </label>
          <Radio.Group
            value={selectedPollutant}
            onChange={(e) => setSelectedPollutant(e.target.value)}
            size="small"
          >
            <Radio.Button value="CO2">CO₂</Radio.Button>
            <Radio.Button value="NOx">NOₓ</Radio.Button>
            <Radio.Button value="PM2.5">PM2.5</Radio.Button>
            <Radio.Button value="PM10">PM10</Radio.Button>
          </Radio.Group>
        </div>
      </div>
    </MapContainer>
  );
};
