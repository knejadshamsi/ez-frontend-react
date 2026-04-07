import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useEZServiceStore } from '~store';
import { useEZSessionStore } from '~stores/session';
import { resetOutputState } from '~stores/reset';
import { cancelSimulation } from '~ez/api';
import type { SessionState } from '~ez/stores/types';
import './locales';

interface UseCancelSimulationReturn {
  handleCancel: () => Promise<void>;
  contextHolder: React.ReactElement;
  cancelDestination: SessionState;
}

export const useCancelSimulation = (): UseCancelSimulationReturn => {
  const { t } = useTranslation('ez-progress');
  const [messageApi, contextHolder] = message.useMessage();

  const ezState = useEZServiceStore((s) => s.state);
  const sessionIntent = useEZServiceStore((s) => s.sessionIntent);
  const setState = useEZServiceStore((s) => s.setState);
  const requestId = useEZSessionStore((s) => s.requestId);

  const cancelDestination: SessionState =
    (sessionIntent === 'LOAD_PREVIOUS_SCENARIO' || sessionIntent === 'LOAD_DEMO_SCENARIO')
      ? 'WELCOME'
      : 'SELECT_PARAMETERS';

  const handleCancel = async () => {
    if (ezState === 'PROCESS_CANCELLING') return;

    // SSE already dead - skip cancel API, just reset and go back
    if (ezState === 'PROCESS_CONNECTION_LOST' || ezState === 'PROCESS_POLLING') {
      resetOutputState();
      setState(cancelDestination);
      return;
    }

    setState('PROCESS_CANCELLING');
    const result = await cancelSimulation(requestId);

    switch (result) {
      case 'success':
        useEZSessionStore.getState().abortSseStream();
        resetOutputState();
        setState(cancelDestination);
        messageApi.success(t('cancellation.success'));
        break;
      case 'conflict':
        setState(cancelDestination);
        messageApi.warning(t('cancellation.conflict'));
        break;
      case 'timeout':
      case 'not_found':
      case 'error':
        useEZSessionStore.getState().abortSseStream();
        setState('PROCESS_CONNECTION_LOST');
        messageApi.error(t('cancellation.failed'));
        break;
    }
  };

  return { handleCancel, contextHolder, cancelDestination };
};
