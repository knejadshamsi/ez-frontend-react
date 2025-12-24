import { useEffect } from 'react';
import { Spin, Button } from 'antd';
import { useEZOutputMapStore } from '~stores/output';
import { useEZOutputFiltersStore } from '~stores/session';
import { useEZServiceStore } from '~store';
import { fetchMapData } from '../../api/mapDataFetch';
import { MapContainer } from '../reusables';
import outputStyles from '../Output.module.less';

/**
 * Trip Legs Map - line layer showing selected trip routes
 * SSE Message: success_map_trip_legs (signals data available)
 * REST: GET /api/simulation/{requestId}/maps/trip-legs
 */
export const Map = () => {
  const state = useEZOutputMapStore((state) => state.tripLegsMapState);
  const mapData = useEZOutputMapStore((state) => state.tripLegsMapData);
  const error = useEZOutputMapStore((state) => state.tripLegsMapError);

  const setState = useEZOutputMapStore((state) => state.setTripLegsMapState);
  const setError = useEZOutputMapStore((state) => state.setTripLegsMapError);

  const isMapVisible = useEZOutputFiltersStore((state) => state.isTripLegsMapVisible);
  const toggleMapVisibility = useEZOutputFiltersStore((state) => state.toggleTripLegsMapVisibility);

  const visibleTripLegIds = useEZOutputFiltersStore((state) => state.visibleTripLegIds);
  const showAllTripLegs = useEZOutputFiltersStore((state) => state.showAllTripLegs);
  const hideAllTripLegs = useEZOutputFiltersStore((state) => state.hideAllTripLegs);

  const isDemoMode = !useEZServiceStore((state) => state.isEzBackendAlive);

  useEffect(() => {
    if (isMapVisible && state === 'success_initial') {
      fetchMapData('tripLegs', isDemoMode);
    }
  }, [isMapVisible, state, isDemoMode]);

  const handleRetry = () => {
    setError(null);
    setState('loading');
    fetchMapData('tripLegs', isDemoMode);
  };

  if (state === 'inactive') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <Spin size="default" tip="Preparing trip legs map..." />
      </div>
    );
  }

  const allPathsVisible = mapData.length > 0 && visibleTripLegIds.size === mapData.length;

  const handleToggleAll = () => {
    if (allPathsVisible) {
      hideAllTripLegs();
    } else {
      showAllTripLegs(mapData.map(p => p.id));
    }
  };

  return (
    <MapContainer
      title="Trip Leg Visualization"
      description="Line layer showing the selected trip route on the network"
      isShown={isMapVisible}
      onToggle={toggleMapVisibility}
      isLoading={state === 'loading'}
      hasData={state === 'success'}
      error={state === 'error_initial' || state === 'error' ? error : null}
      onRetry={handleRetry}
    >
      <div className={outputStyles.tripLegsMapContainer}>
        <span className={outputStyles.tripLegsMapText}>
          {mapData.length} paths loaded. Select row from table below to view it on the map.
        </span>
        <Button
          type={allPathsVisible ? 'primary' : 'default'}
          size="small"
          onClick={handleToggleAll}
        >
          {allPathsVisible ? 'Hide all' : 'Show all'}
        </Button>
      </div>
    </MapContainer>
  );
};
