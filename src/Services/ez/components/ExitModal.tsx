import { useEffect, useRef } from 'react';
import { Modal, Space, message, Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useEZSessionStore } from '~stores/session';
import { useEZServiceStore } from '~store';
import { hasOutputData } from '~stores/output';
import { confirmExit, cancelExit } from '../exitHandler';
import { resetAllEZStores } from '~stores/reset';
import { useServiceStore } from '~globalStores';
import { CopyRequestIdButton } from './CopyRequestIdButton';

export default function ExitModal() {
  const [modal, modalContextHolder] = Modal.useModal();
  const [messageApi, contextHolder] = message.useMessage();
  const setActiveService = useServiceStore((state) => state.setActiveService);
  const isResettingRef = useRef(false);

  const exitState = useEZSessionStore((state) => state.exitState);
  const exitWarning = useEZSessionStore((state) => state.exitWarning);
  const isEzBackendAlive = useEZServiceStore((state) => state.isEzBackendAlive);
  const ezState = useEZServiceStore((state) => state.state);
  const requestId = useEZSessionStore((state) => state.requestId);

  useEffect(() => {
    if (exitState === 'await_confirmation' && exitWarning) {
      // Check if copy button should be shown
      const showCopyButton =
        isEzBackendAlive &&
        ezState === 'RESULT_VIEW' &&
        hasOutputData() &&
        requestId &&
        requestId.trim() !== '';

      const instance = modal.confirm({
        title: exitWarning.title,
        icon: <ExclamationCircleOutlined />,
        content: exitWarning.message,
        okText: 'Exit Anyway',
        okType: 'danger',
        cancelText: 'Stay in EZ',
        closable: false,
        maskClosable: false,
        keyboard: false,
        footer: () => (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {showCopyButton && (
              <CopyRequestIdButton
                requestId={requestId}
                showText={true}
                text="Copy"
                size="small"
                type="default"
                messageApi={messageApi}
              />
            )}
            <Space size={8}>
              <Button
                size="small"
                onClick={() => {
                  cancelExit();
                  instance.destroy();
                }}
              >
                Stay in EZ
              </Button>
              <Button
                size="small"
                danger
                ghost
                onClick={() => {
                  confirmExit();
                  instance.destroy();
                }}
              >
                Exit Anyway
              </Button>
            </Space>
          </div>
        ),
        onCancel: () => {
          cancelExit();
        },
        onOk: () => {
          confirmExit();
        },
      });
    } else if (exitState === 'resetting' && !isResettingRef.current) {
      isResettingRef.current = true;

      resetAllEZStores();

      const sessionStore = useEZSessionStore.getState();
      sessionStore.setExitState('idle');
      sessionStore.setExitWarning(null);

      setActiveService('REST');

      isResettingRef.current = false;
    }
  }, [exitState, exitWarning, modal, setActiveService, isEzBackendAlive, ezState, requestId, messageApi]);

  return (
    <>
      {modalContextHolder}
      {contextHolder}
    </>
  );
}
