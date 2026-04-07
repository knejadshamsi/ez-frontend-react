import { createElement, useEffect, useRef } from 'react';
import type { MessageInstance } from 'antd/es/message/interface';
import type { HookAPI } from 'antd/es/modal/useModal';
import type { NotificationInstance } from 'antd/es/notification/interface';
import { Button } from 'antd';
import i18n from '~i18nConfig';
import '~ez/locales';
import { useEZServiceStore } from '~store';
import { useEZSessionStore } from '~stores/session';
import { resetOutputState } from '~stores/reset';
import { isProcessState } from './stores/types';
import type { ConnectionState } from './stores/types';
import { EZFeedbackModal } from './components/EZFeedbackModal';

const t = i18n.t.bind(i18n);

export const useBackendAliveWatcher = (
  messageApi: MessageInstance,
  modal: HookAPI,
  notificationApi: NotificationInstance
): void => {
  const connectionState = useEZServiceStore((state) => state.connectionState);
  const prevRef = useRef<ConnectionState>(connectionState);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = connectionState;

    const ezState = useEZServiceStore.getState().state;

    if (connectionState === 'FULL_DISCONNECT' && prev !== 'FULL_DISCONNECT') {
      const sessionIntent = useEZServiceStore.getState().sessionIntent;

      // Already in demo/offline mode - no need to show disconnect modal
      if (sessionIntent === 'LOAD_DEMO_SCENARIO' || sessionIntent === 'VIEW_SCENARIO_OFFLINE') {
        return;
      }

      if (isProcessState(ezState)) {
        EZFeedbackModal(modal, {
          title: t('ez-root:connectionLost.title'),
          content: t('ez-root:connectionLost.content'),
          actions: [
            {
              label: t('ez-root:connectionLost.wait'),
            },
            {
              label: t('ez-root:connectionLost.switchToDemo'),
              highlight: true,
              onClick: () => {
                useEZSessionStore.getState().abortSseStream();
                resetOutputState();
                useEZServiceStore.getState().setSessionIntent('LOAD_DEMO_SCENARIO');
                useEZServiceStore.getState().setState('SELECT_PARAMETERS');
              },
            },
          ],
        });
      } else if (ezState === 'VIEW_RESULTS' || ezState === 'VIEW_PARAMETERS') {
        EZFeedbackModal(modal, {
          title: t('ez-root:connectionLost.title'),
          content: t('ez-root:connectionLost.contentViewMode'),
          actions: [
            {
              label: t('ez-root:connectionLost.stayOffline'),
              onClick: () => {
                useEZServiceStore.getState().setSessionIntent('VIEW_SCENARIO_OFFLINE');
              },
            },
            {
              label: t('ez-root:connectionLost.switchToDemo'),
              highlight: true,
              onClick: () => {
                useEZServiceStore.getState().setSessionIntent('LOAD_DEMO_SCENARIO');
                useEZServiceStore.getState().setState('SELECT_PARAMETERS');
              },
            },
          ],
        });
      } else {
        useEZServiceStore.getState().setSessionIntent('LOAD_DEMO_SCENARIO');
        messageApi.warning(t('ez-root:connectionMessages.switchingToDemo'));
      }
      return;
    }

    // Skip remaining logic for process states
    if (isProcessState(ezState)) return;

    if (connectionState === 'FULL_CONNECT' && prev !== 'FULL_CONNECT') {
      const sessionIntent = useEZServiceStore.getState().sessionIntent;

      if (sessionIntent === 'LOAD_DEMO_SCENARIO' || sessionIntent === 'VIEW_SCENARIO_OFFLINE') {
        const notificationKey = 'backend-recovered';
        notificationApi.info({
          key: notificationKey,
          message: t('ez-root:connectionMessages.recoveredTitle'),
          description: t('ez-root:connectionMessages.recoveredDescription'),
          btn: createElement(Button, {
            type: 'primary',
            size: 'small',
            onClick: () => {
              const requestId = useEZSessionStore.getState().requestId;
              if (requestId && requestId.trim() !== '') {
                useEZServiceStore.getState().setSessionIntent('LOAD_PREVIOUS_SCENARIO');
              } else {
                useEZServiceStore.getState().setSessionIntent('RUN_NEW_SIMULATION');
              }
              notificationApi.destroy(notificationKey);
            },
          }, t('ez-root:connectionMessages.switchToLive')),
          duration: 0,
        });
      } else {
        const requestId = useEZSessionStore.getState().requestId;
        if (requestId && requestId.trim() !== '') {
          useEZServiceStore.getState().setSessionIntent('LOAD_PREVIOUS_SCENARIO');
        } else {
          useEZServiceStore.getState().setSessionIntent('RUN_NEW_SIMULATION');
        }
        messageApi.success(t('ez-root:connectionMessages.connected'));
      }
    }
  }, [connectionState, messageApi, modal, notificationApi]);
};
