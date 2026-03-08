import { useEffect } from 'react';
import { Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { useEZOutputMapStore } from '~stores/output';
import { useEZOutputFiltersStore } from '~stores/session';
import { useEZServiceStore } from '~store';
import { fetchMapData } from '~ez/api';
import { MapContainer } from '../utils';
import outputStyles from '../Output.module.less';
import './locales';

/**
 * Trip Legs Map - line layer showing selected trip routes
 * SSE Message: success_map_trip_legs (signals data available)
 * REST: GET /scenario/{requestId}/maps/trip-legs
 */
export const TripLegs = () => {
  const { t } = useTranslation('ez-output-maps');
  const state = useEZOutputMapStore((s) => s.tripLegsMapState);
  const error = useEZOutputMapStore((s) => s.tripLegsMapError);

  const setState = useEZOutputMapStore((s) => s.setTripLegsMapState);
  const setError = useEZOutputMapStore((s) => s.setTripLegsMapError);

  const isMapVisible = useEZOutputFiltersStore((s) => s.isTripLegsMapVisible);
  const toggleMapVisibility = useEZOutputFiltersStore((s) => s.toggleTripLegsMapVisibility);

  const isDemoMode = !useEZServiceStore((s) => s.isEzBackendAlive);

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
        <Spin size="default" tip={t('tripLegs.loadingTip')} />
      </div>
    );
  }

  return (
    <MapContainer
      title={t('tripLegs.title')}
      description={t('tripLegs.description')}
      isShown={isMapVisible}
      onToggle={toggleMapVisibility}
      isLoading={state === 'loading'}
      hasData={state === 'success'}
      error={state === 'error_initial' || state === 'error' ? error : null}
      onRetry={handleRetry}
    />
  );
};
