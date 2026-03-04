import { useEffect, useRef } from 'react';
import { Modal, Space, message, Button } from 'antd';
import { ExclamationCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import './locales';
import { useEZSessionStore, useDraftStore } from '~stores/session';
import { useEZServiceStore, useAPIPayloadStore } from '~store';
import { confirmExit, cancelExit } from '../exitHandler';
import { resetAllEZStores } from '~stores/reset';
import { useServiceStore } from '~globalStores';
import { CopyRequestIdButton } from './CopyRequestIdButton';
import { deleteScenario } from '../api/deleteScenario';
import { createDraft, updateDraft } from '../api/draft';
import { createMetadataPayload } from '../api/updateScenarioMetadata';
import { hasInputChangedFromDefault } from '../exitHandler';
import type { MainInputPayload } from '~stores/types';

function buildCurrentInput(): MainInputPayload {
  const payload = useAPIPayloadStore.getState().payload;
  const session = useEZSessionStore.getState();
  return {
    scenarioTitle: session.scenarioTitle,
    scenarioDescription: session.scenarioDescription,
    zones: payload.zones,
    customSimulationAreas: payload.customSimulationAreas,
    scaledSimulationAreas: payload.scaledSimulationAreas,
    sources: payload.sources,
    simulationOptions: payload.simulationOptions,
    carDistribution: payload.carDistribution,
    modeUtilities: payload.modeUtilities,
  };
}

export default function ExitModal() {
  const { t } = useTranslation('ez-components');
  const [modal, modalContextHolder] = Modal.useModal();
  const [messageApi, contextHolder] = message.useMessage();
  const setActiveService = useServiceStore((state) => state.setActiveService);
  const isResettingRef = useRef(false);
  const modalInstanceRef = useRef<ReturnType<typeof modal.confirm> | null>(null);

  const exitState = useEZSessionStore((state) => state.exitState);
  const exitWarning = useEZSessionStore((state) => state.exitWarning);
  const setExitState = useEZSessionStore((state) => state.setExitState);
  const setExitWarning = useEZSessionStore((state) => state.setExitWarning);
  const ezState = useEZServiceStore((state) => state.state);
  const isEzBackendAlive = useEZServiceStore((state) => state.isEzBackendAlive);
  const requestId = useEZSessionStore((state) => state.requestId);
  const draftId = useDraftStore((state) => state.draftId);

  // Builds the footer with fresh state reads
  const buildFooter = (instance: ReturnType<typeof modal.confirm>) => {
    const alive = useEZServiceStore.getState().isEzBackendAlive;
    const currentRequestId = useEZSessionStore.getState().requestId;
    const currentDraftId = useDraftStore.getState().draftId;
    const hasReqId = currentRequestId && currentRequestId.trim() !== '';
    const isWelcome = useEZServiceStore.getState().state === 'WELCOME';
    const isPS = useEZServiceStore.getState().state === 'PARAMETER_SELECTION';
    const canDraft = alive && isPS && hasInputChangedFromDefault();
    const showCopy = alive && hasReqId;
    const showDelete = alive && hasReqId && !isWelcome;

    if (isWelcome) {
      return (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Space size={8}>
            <Button
              size="small"
              onClick={() => {
                cancelExit();
                instance.destroy();
                modalInstanceRef.current = null;
              }}
            >
              {t('exitModal.stayInEZ')}
            </Button>
            <Button
              size="small"
              type="primary"
              onClick={() => {
                confirmExit();
                instance.destroy();
                modalInstanceRef.current = null;
              }}
            >
              {t('exitModal.exit')}
            </Button>
          </Space>
        </div>
      );
    }

    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {showCopy && (
          <CopyRequestIdButton
            requestId={currentRequestId}
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
              modalInstanceRef.current = null;
            }}
          >
            {t('exitModal.stayInEZ')}
          </Button>
          {canDraft && (
            <Button
              size="small"
              onClick={async () => {
                instance.update({
                  footer: () => (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <Button size="small" disabled>
                        <LoadingOutlined /> {t('exitModal.savingDraft')}
                      </Button>
                    </div>
                  ),
                });
                try {
                  const input = buildCurrentInput();
                  const session = createMetadataPayload();
                  let savedDraftId: string;

                  if (currentDraftId) {
                    await updateDraft(currentDraftId, input, session);
                    savedDraftId = currentDraftId;
                  } else {
                    savedDraftId = await createDraft(input, session);
                  }

                  messageApi.success(t('exitModal.draftSaved', { draftId: savedDraftId }));
                  confirmExit();
                  instance.destroy();
                  modalInstanceRef.current = null;
                } catch (error) {
                  const errorMsg = error instanceof Error ? error.message : t('exitModal.draftError');
                  messageApi.error(errorMsg);
                  console.error('[Exit Modal] Draft save failed:', error);
                  instance.destroy();
                  modalInstanceRef.current = null;
                  cancelExit();
                }
              }}
            >
              {t('exitModal.saveDraftAndExit')}
            </Button>
          )}
          {showDelete && (
            <Button
              size="small"
              danger
              ghost
              onClick={async () => {
                instance.update({
                  footer: () => (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <Button size="small" danger ghost disabled>
                        <LoadingOutlined /> {t('exitModal.deletingAndCancelling')}
                      </Button>
                    </div>
                  ),
                });
                try {
                  await deleteScenario(currentRequestId);
                  messageApi.success(t('exitModal.deleteSuccess'));
                  confirmExit();
                  instance.destroy();
                  modalInstanceRef.current = null;
                } catch (error) {
                  const errorMsg = error instanceof Error ? error.message : t('exitModal.deleteError');
                  messageApi.error(errorMsg);
                  console.error('[Exit Modal] Delete failed:', error);
                  instance.destroy();
                  modalInstanceRef.current = null;
                  cancelExit();
                }
              }}
            >
              {t('exitModal.deleteAndExit')}
            </Button>
          )}
          <Button
            size="small"
            type="primary"
            onClick={() => {
              confirmExit();
              instance.destroy();
              modalInstanceRef.current = null;
            }}
          >
            {t('exitModal.exit')}
          </Button>
        </Space>
      </div>
    );
  };

  // Create modal when exit is requested
  useEffect(() => {
    if (exitState === 'await_confirmation' && exitWarning && !modalInstanceRef.current) {
      const instance = modal.confirm({
        title: exitWarning.title,
        icon: <ExclamationCircleOutlined />,
        content: exitWarning.message,
        okText: t('exitModal.exit'),
        okType: 'primary',
        cancelText: t('exitModal.stayInEZ'),
        closable: false,
        maskClosable: false,
        keyboard: false,
        footer: () => buildFooter(instance),
        onCancel: () => {
          cancelExit();
          modalInstanceRef.current = null;
        },
        onOk: () => {
          confirmExit();
          modalInstanceRef.current = null;
        },
      });
      modalInstanceRef.current = instance;
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
  }, [exitState, exitWarning, setExitState, setExitWarning, modal, setActiveService, messageApi, t]);

  // Reactively update modal when backend status changes while modal is open
  useEffect(() => {
    if (modalInstanceRef.current && exitState === 'await_confirmation') {
      modalInstanceRef.current.update({
        footer: () => buildFooter(modalInstanceRef.current!),
      });
    }
  }, [isEzBackendAlive]);

  return (
    <>
      {modalContextHolder}
      {contextHolder}
    </>
  );
}
