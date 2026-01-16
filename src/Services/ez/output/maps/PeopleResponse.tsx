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

/**
 * People Response Map - spatial distribution of behavioral responses
 * SSE Message: success_map_people_response
 */
export const PeopleResponse = () => {
  const { t } = useTranslation('ez-output-maps');
  const state = useEZOutputMapStore((state) => state.peopleResponseMapState);
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
        <Spin size="default" tip={t('peopleResponse.loadingTip')} />
      </div>
    );
  }

  return (
    <MapContainer
      title={t('peopleResponse.title')}
      description={t('peopleResponse.description')}
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
            {t('peopleResponse.controls.viewType')}
          </label>
          <Radio.Group
            value={responseLayerView}
            onChange={(e) => setResponseLayerView(e.target.value)}
            size="small"
          >
            <Radio.Button value="origin">{t('peopleResponse.viewTypes.origin')}</Radio.Button>
            <Radio.Button value="destination">{t('peopleResponse.viewTypes.destination')}</Radio.Button>
          </Radio.Group>
        </div>

        <div className={outputStyles.controlGroup}>
          <label className={outputStyles.controlLabel}>
            {t('peopleResponse.controls.responseType')}
          </label>
          <div className={outputStyles.responseTypeWrapper}>
            <Radio.Group
              value={responseType}
              onChange={(e) => setResponseType(e.target.value)}
              size="small"
            >
              <Radio.Button value="paidPenalty">{t('peopleResponse.responseTypes.paidPenalty')}</Radio.Button>
              <Radio.Button value="rerouted">{t('peopleResponse.responseTypes.rerouted')}</Radio.Button>
              <Radio.Button value="switchedToBus">{t('peopleResponse.responseTypes.switchedToBus')}</Radio.Button>
              <Radio.Button value="switchedToSubway">{t('peopleResponse.responseTypes.switchedToSubway')}</Radio.Button>
              <Radio.Button value="switchedToWalking">{t('peopleResponse.responseTypes.switchedToWalking')}</Radio.Button>
              <Radio.Button value="switchedToBiking">{t('peopleResponse.responseTypes.switchedToBiking')}</Radio.Button>
              <Radio.Button value="cancelledTrip">{t('peopleResponse.responseTypes.cancelledTrip')}</Radio.Button>
            </Radio.Group>
          </div>
        </div>
      </div>
    </MapContainer>
  );
};
