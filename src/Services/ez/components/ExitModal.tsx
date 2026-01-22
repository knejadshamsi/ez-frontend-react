import { useEffect, useRef } from 'react';
import { Modal, Space, message, Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import './locales';
import { useEZSessionStore } from '~stores/session';
import { useEZServiceStore } from '~store';
import { hasOutputData } from '~stores/output';
import { confirmExit, cancelExit } from '../exitHandler';
import { resetAllEZStores } from '~stores/reset';
import { useServiceStore } from '~globalStores';
import { CopyRequestIdButton } from './CopyRequestIdButton';
import { updateScenarioMetadata } from '../api/updateScenarioMetadata';

export default function ExitModal() {
  const { t } = useTranslation('ez-components');
  const [modal, modalContextHolder] = Modal.useModal();
  const [messageApi, contextHolder] = message.useMessage();
  const setActiveService = useServiceStore((state) => state.setActiveService);
  const isResettingRef = useRef(false);

  const exitState = useEZSessionStore((state) => state.exitState);
  const exitWarning = useEZSessionStore((state) => state.exitWarning);
  const setExitState = useEZSessionStore((state) => state.setExitState);
  const setExitWarning = useEZSessionStore((state) => state.setExitWarning);
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

      // Check if save button should be shown
      const showSaveButton =
        isEzBackendAlive &&
        requestId &&
        requestId.trim() !== '';

      const instance = modal.confirm({
        title: exitWarning.title,
        icon: <ExclamationCircleOutlined />,
        content: exitWarning.message,
        okText: t('exitModal.exitAnyway'),
        okType: 'danger',
        cancelText: t('exitModal.stayInEZ'),
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
                text={t('exitModal.copy')}
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
                {t('exitModal.stayInEZ')}
              </Button>
              {showSaveButton && (
                <Button
                  size="small"
                  type="primary"
                  onClick={async () => {
                    const loadingKey = 'saving';
                    try {
                      messageApi.loading({ content: t('exitModal.saving'), key: loadingKey, duration: 0 });
                      await updateScenarioMetadata(requestId);
                      messageApi.destroy(loadingKey);
                      messageApi.success(t('exitModal.saveSuccess'));
                      confirmExit();
                      instance.destroy();
                    } catch (error) {
                      messageApi.destroy(loadingKey);
                      const errorMsg = error instanceof Error ? error.message : t('exitModal.saveError');
                      messageApi.error(errorMsg);
                      console.error('[Exit Modal] Save failed:', error);
                    }
                  }}
                >
                  {t('exitModal.saveAndExit')}
                </Button>
              )}
              <Button
                size="small"
                danger
                ghost
                onClick={() => {
                  confirmExit();
                  instance.destroy();
                }}
              >
                {t('exitModal.exitWithoutSaving')}
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

      resetAllEZStores().then(() => {
        setExitState('idle');
        setExitWarning(null);
        setActiveService('REST');
        isResettingRef.current = false;
      }).catch((error) => {
        console.error('[Exit Modal] Reset failed:', error);
        isResettingRef.current = false;
      });
    }
  }, [exitState, exitWarning, setExitState, setExitWarning, modal, setActiveService, isEzBackendAlive, ezState, requestId, messageApi, t]);

  return (
    <>
      {modalContextHolder}
      {contextHolder}
    </>
  );
}
