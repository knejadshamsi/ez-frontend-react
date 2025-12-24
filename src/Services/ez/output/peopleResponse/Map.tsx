import { useEffect } from 'react';
import { Radio, Spin } from 'antd';
import { useEZOutputMapStore, getPeopleResponsePoints } from '~stores/output';
import { useEZOutputFiltersStore } from '~stores/session';
import { useEZServiceStore } from '~store';
import { fetchMapData } from '../../api/mapDataFetch';
import { MapContainer } from '../reusables';
import outputStyles from '../Output.module.less';

/**
 * People Response Map - spatial distribution of behavioral responses
 * SSE Message: success_map_people_response
 */
export const Map = () => {
  const state = useEZOutputMapStore((state) => state.peopleResponseMapState);
  const mapData = useEZOutputMapStore((state) => state.peopleResponseMapData);
  const error = useEZOutputMapStore((state) => state.peopleResponseMapError);

  const setState = useEZOutputMapStore((state) => state.setPeopleResponseMapState);
  const setError = useEZOutputMapStore((state) => state.setPeopleResponseMapError);

  const responseLayerView = useEZOutputFiltersStore((state) => state.selectedResponseLayerView);
  const responseType = useEZOutputFiltersStore((state) => state.selectedBehavioralResponseType);
  const isMapVisible = useEZOutputFiltersStore((state) => state.isPeopleResponseMapVisible);

  const setResponseLayerView = useEZOutputFiltersStore((state) => state.setSelectedResponseLayerView);
  const setResponseType = useEZOutputFiltersStore((state) => state.setSelectedBehavioralResponseType);
  const toggleMapVisibility = useEZOutputFiltersStore((state) => state.togglePeopleResponseMapVisibility);

  const isDemoMode = !useEZServiceStore((state) => state.isEzBackendAlive);

  useEffect(() => {
    if (isMapVisible && state === 'success_initial') {
      fetchMapData('peopleResponse', isDemoMode);
    }
  }, [isMapVisible, state, isDemoMode]);

  const handleRetry = () => {
    setError(null);
    setState('loading');
    fetchMapData('peopleResponse', isDemoMode);
  };

  if (state === 'inactive') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <Spin size="default" tip="Preparing people response map..." />
      </div>
    );
  }

  const currentPoints = getPeopleResponsePoints(mapData, responseLayerView, responseType);

  return (
    <MapContainer
      title="People Response Map"
      description="Screen grid visualization showing spatial distribution of behavioral responses"
      isShown={isMapVisible}
      onToggle={toggleMapVisibility}
      isLoading={state === 'loading'}
      hasData={state === 'success'}
      error={state === 'error_initial' || state === 'error' ? error : null}
      onRetry={handleRetry}
    >

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
