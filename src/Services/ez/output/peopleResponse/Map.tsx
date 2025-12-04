import { useEffect } from 'react';
import { Radio, Spin, Alert } from 'antd';
import { useEZOutputMapReadyStore } from '~stores/output';
import { useEZOutputMapStore, getPeopleResponsePoints } from '~stores/output';
import { useEZOutputFiltersStore } from '~stores/session';
import { useEZServiceStore } from '~store';
import { fetchMapData } from '../../api/mapDataFetch';
import { MapContainer } from '../reusables';
import outputStyles from '../Output.module.less';

/**
 * People Response Map - spatial distribution of behavioral responses
 * SSE Message: map_ready_people_response
 */
export const Map = () => {
  const isMapDataReady = useEZOutputMapReadyStore((state) => state.isPeopleResponseMapDataReady);

  const mapData = useEZOutputMapStore((state) => state.peopleResponseMapData);
  const isLoading = useEZOutputMapStore((state) => state.isPeopleResponseMapLoading);
  const error = useEZOutputMapStore((state) => state.peopleResponseMapError);

  const responseLayerView = useEZOutputFiltersStore((state) => state.selectedResponseLayerView);
  const responseType = useEZOutputFiltersStore((state) => state.selectedBehavioralResponseType);
  const isMapVisible = useEZOutputFiltersStore((state) => state.isPeopleResponseMapVisible);

  const setResponseLayerView = useEZOutputFiltersStore((state) => state.setSelectedResponseLayerView);
  const setResponseType = useEZOutputFiltersStore((state) => state.setSelectedBehavioralResponseType);
  const toggleMapVisibility = useEZOutputFiltersStore((state) => state.togglePeopleResponseMapVisibility);

  const isDemoMode = !useEZServiceStore((state) => state.isEzBackendAlive);

  useEffect(() => {
    if (isMapVisible && !mapData && !isLoading) {
      fetchMapData('peopleResponse', isDemoMode);
    }
  }, [isMapVisible, mapData, isLoading, isDemoMode, fetchMapData]);

  const currentPoints = getPeopleResponsePoints(mapData, responseLayerView, responseType);

  if (!isMapDataReady) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <Spin size="default" tip="Preparing people response map..." />
      </div>
    );
  }

  return (
    <MapContainer
      title="People Response Map"
      description="Screen grid visualization showing spatial distribution of behavioral responses"
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

      <div className={outputStyles.mapControlsContainerVertical}>
        <div className={outputStyles.controlGroup}>
          <label className={outputStyles.controlLabel}>
            View Type
          </label>
          <Radio.Group
            value={responseLayerView}
            onChange={(e) => setResponseLayerView(e.target.value)}
            size="small"
          >
            <Radio.Button value="origin">Origin</Radio.Button>
            <Radio.Button value="destination">Destination</Radio.Button>
          </Radio.Group>
        </div>

        <div className={outputStyles.controlGroup}>
          <label className={outputStyles.controlLabel}>
            Response Type
          </label>
          <div className={outputStyles.responseTypeWrapper}>
            <Radio.Group
              value={responseType}
              onChange={(e) => setResponseType(e.target.value)}
              size="small"
            >
              <Radio.Button value="paidPenalty">Paid Penalty</Radio.Button>
              <Radio.Button value="rerouted">Rerouted</Radio.Button>
              <Radio.Button value="switchedToBus">Changed to Bus</Radio.Button>
              <Radio.Button value="switchedToSubway">Changed to Subway</Radio.Button>
              <Radio.Button value="switchedToWalking">Changed to Walking</Radio.Button>
              <Radio.Button value="switchedToBiking">Changed to Biking</Radio.Button>
              <Radio.Button value="cancelledTrip">Trip Cancelled</Radio.Button>
            </Radio.Group>
          </div>
        </div>
      </div>
    </MapContainer>
  );
};
