import { useEffect } from 'react';
import type { MessageInstance } from 'antd/es/message/interface';
import i18n from '~i18nConfig';
import '~ez/locales';
import { useEZServiceStore } from '~store';
import { useEZSessionStore } from '~stores/session';
import { useEZOutputFiltersStore } from '~stores/session';
import { useProgressStore } from './progress/store';
import { resetAllEZOutputStores } from '~stores/output';

const t = i18n.t.bind(i18n);

export const useBackendAliveWatcher = (messageApi: MessageInstance): void => {
  const ezState = useEZServiceStore((state) => state.state);
  const setState = useEZServiceStore((state) => state.setState);
  const isEzBackendAlive = useEZServiceStore((state) => state.isEzBackendAlive);

  const isNewSimulation = useEZSessionStore((state) => state.isNewSimulation);
  const setRequestId = useEZSessionStore((state) => state.setRequestId);
  const abortSseStream = useEZSessionStore((state) => state.abortSseStream);

  const resetProgress = useProgressStore((state) => state.reset);
  const hideProgress = useProgressStore((state) => state.hide);

  const resetOutputFilters = useEZOutputFiltersStore((state) => state.reset);

  useEffect(() => {
    if (!isEzBackendAlive) return;

    if (ezState !== 'AWAIT_RESULTS' && ezState !== 'RESULT_VIEW') return;

    abortSseStream();

    resetAllEZOutputStores();

    resetProgress();
    hideProgress();

    resetOutputFilters();

    setRequestId('');

    if (isNewSimulation) {
      setState('PARAMETER_SELECTION');
      messageApi.success(t('ez-root:connectionMessages.backendOnlineNewSim'));
    } else {
      setState('WELCOME');
      messageApi.success(t('ez-root:connectionMessages.backendOnlineLoadScenario'));
    }
  }, [
    isEzBackendAlive,
    ezState,
    isNewSimulation,
    abortSseStream,
    resetProgress,
    hideProgress,
    resetOutputFilters,
    setRequestId,
    setState,
    messageApi,
  ]);
};
