import { useEffect } from 'react';
import { Radio, Checkbox, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { useEZOutputMapStore } from '~stores/output';
import { useEZOutputFiltersStore } from '~stores/session';
import { useEZServiceStore } from '~store';
import { fetchMapData } from '~ez/api';
import type { PeopleResponseCategory } from '~stores/session/types';
import { MapContainer } from '../utils';
import outputStyles from '../Output.module.less';
import './locales';

const CATEGORIES: PeopleResponseCategory[] = ['modeShift', 'rerouted', 'paidPenalty', 'cancelled'];

const CATEGORY_COLORS: Record<string, string> = {
  modeShift: '#4096ff',
  rerouted: '#fa8c16',
  paidPenalty: '#8c8c8c',
  cancelled: '#eb2f96',
};

// Interactive people response map with view type and color-coded category checkboxes on separate rows
export const PeopleResponse = () => {
  const { t } = useTranslation('ez-output-maps');
  const state = useEZOutputMapStore((s) => s.peopleResponseMapState);
  const error = useEZOutputMapStore((s) => s.peopleResponseMapError);

  const setState = useEZOutputMapStore((s) => s.setPeopleResponseMapState);
  const setError = useEZOutputMapStore((s) => s.setPeopleResponseMapError);

  const selectedView = useEZOutputFiltersStore((s) => s.selectedResponseLayerView);
  const visibleCategories = useEZOutputFiltersStore((s) => s.visibleResponseCategories);
  const isMapVisible = useEZOutputFiltersStore((s) => s.isPeopleResponseMapVisible);

  const setSelectedView = useEZOutputFiltersStore((s) => s.setSelectedResponseLayerView);
  const toggleCategory = useEZOutputFiltersStore((s) => s.toggleResponseCategory);
  const toggleMapVisibility = useEZOutputFiltersStore((s) => s.togglePeopleResponseMapVisibility);

  const isDemoMode = !useEZServiceStore((s) => s.isEzBackendAlive);

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
      <div className={outputStyles.spinnerContainer}>
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
            value={selectedView}
            onChange={(e) => setSelectedView(e.target.value)}
            size="small"
          >
            <Radio.Button value="origin">{t('peopleResponse.viewTypes.origin')}</Radio.Button>
            <Radio.Button value="destination">{t('peopleResponse.viewTypes.destination')}</Radio.Button>
          </Radio.Group>
        </div>

        <div className={outputStyles.controlGroup}>
          <label className={outputStyles.controlLabel}>
            {t('peopleResponse.controls.responseCategory')}
          </label>
          <div className={outputStyles.categoryCheckboxRow}>
            {CATEGORIES.map((cat) => (
              <Checkbox
                key={cat}
                checked={visibleCategories.has(cat)}
                onChange={() => toggleCategory(cat)}
              >
                <span style={{ color: CATEGORY_COLORS[cat] }}>
                  {t(`peopleResponse.categories.${cat}`)}
                </span>
              </Checkbox>
            ))}
          </div>
        </div>
      </div>
    </MapContainer>
  );
};
