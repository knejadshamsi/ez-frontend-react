import { useEffect, useRef } from 'react';
import type { MessageInstance } from 'antd/es/message/interface';
import i18n from '~i18nConfig';
import '~ez/locales';
import { useEZServiceStore } from '~store';
import { useEZSessionStore } from '~stores/session';
import { resetOutputState } from '~stores/reset';

const t = i18n.t.bind(i18n);

export const useBackendAliveWatcher = (messageApi: MessageInstance): void => {
  const isEzBackendAlive = useEZServiceStore((state) => state.isEzBackendAlive);
  const wasAliveRef = useRef(isEzBackendAlive);

  useEffect(() => {
    const prev = wasAliveRef.current;
    wasAliveRef.current = isEzBackendAlive;

    // Only act on false -> true transition
    if (!isEzBackendAlive || prev) return;

    const { state: ezState, setState } = useEZServiceStore.getState();
    if (ezState !== 'AWAIT_RESULTS') return;

    const { isNewSimulation, setRequestId, abortSseStream } = useEZSessionStore.getState();

    abortSseStream();
    resetOutputState();
    setRequestId('');

    if (isNewSimulation) {
      setState('PARAMETER_SELECTION');
      messageApi.success(t('ez-root:connectionMessages.backendOnlineNewSim'));
    } else {
      setState('WELCOME');
      messageApi.success(t('ez-root:connectionMessages.backendOnlineLoadScenario'));
    }
  }, [isEzBackendAlive, messageApi]);
};
