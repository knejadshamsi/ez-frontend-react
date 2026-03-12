import { useEffect } from 'react';
import { Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { useEZOutputMapStore } from '~stores/output';
import { useEZOutputFiltersStore } from '~stores/session';
import { useEZServiceStore } from '~store';
import { fetchMapData } from '~ez/api';
import outputStyles from '../Output.module.less';
import './locales';

/**
 * Trip Legs Map - starts empty, driven by table row selection
 * Selected rows from the table are displayed as arcs on the map
 * Visibility controlled by tripLegsViewMode in the table's control panel
 */
export const TripLegs = () => {
  const { t } = useTranslation('ez-output-maps');
  const state = useEZOutputMapStore((s) => s.tripLegsMapState);

  const tripLegsViewMode = useEZOutputFiltersStore((s) => s.tripLegsViewMode);
  const isDemoMode = !useEZServiceStore((s) => s.isEzBackendAlive);

  const isVisible = tripLegsViewMode !== 'hidden';

  useEffect(() => {
    if (isVisible && state === 'success_initial') {
      fetchMapData('tripLegs', isDemoMode);
    }
  }, [isVisible, state, isDemoMode]);

  if (!isVisible) return null;

  if (state === 'inactive') {
    return (
      <div className={outputStyles.spinnerContainer}>
        <Spin size="default" tip={t('tripLegs.loadingTip')} />
      </div>
    );
  }

  return null;
};
