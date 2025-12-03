import { useEffect } from 'react';
import { Radio, Spin, Alert } from 'antd';
import { useEZOutputMapReadyStore } from '~stores/output';
import { useEZOutputMapStore } from '~stores/output';
import { useEZOutputFiltersStore } from '~stores/session';
import { useEZServiceStore } from '~store';
import { fetchMapData } from '../../api/mapDataFetch';
import { MapContainer } from '../reusables';
import outputStyles from '../Output.module.less';

// Interactive emissions map with pollutant selector and visualization toggle
export const Map = () => {
  const isMapDataReady = useEZOutputMapReadyStore((state) => state.isEmissionsMapDataReady);

  const mapData = useEZOutputMapStore((state) => state.emissionsMapData);
  const isLoading = useEZOutputMapStore((state) => state.isEmissionsMapLoading);
  const error = useEZOutputMapStore((state) => state.emissionsMapError);

  const visualizationType = useEZOutputFiltersStore((state) => state.selectedVisualizationType);
  const selectedPollutant = useEZOutputFiltersStore((state) => state.selectedPollutantType);
  const isMapVisible = useEZOutputFiltersStore((state) => state.isEmissionsMapVisible);

  const setVisualizationType = useEZOutputFiltersStore((state) => state.setSelectedVisualizationType);
  const setSelectedPollutant = useEZOutputFiltersStore((state) => state.setSelectedPollutantType);
  const toggleMapVisibility = useEZOutputFiltersStore((state) => state.toggleEmissionsMapVisibility);

  const isDemoMode = !useEZServiceStore((state) => state.isEzBackendAlive);

  useEffect(() => {
    if (isMapVisible && !mapData && !isLoading) {
      fetchMapData('emissions', isDemoMode);
    }
  }, [isMapVisible, mapData, isLoading, isDemoMode, fetchMapData]);

  if (!isMapDataReady) {
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
    >
      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
          <Spin size="small" tip="Loading map data..." />
        </div>
      )}

      {error && (
        <Alert
          message="Error loading map data"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}

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
