import { Button, Tooltip } from 'antd';
import {
  ClockCircleOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  LoginOutlined,
  FileOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useBatchStore } from '~stores/batch';
import { useEZServiceStore } from '~store';
import { useEZSessionStore, useDraftStore } from '~stores/session';
import { resetOutputState } from '~stores/reset';
import { loadScenario } from '~ez/api/startSimulation';
import { cancelSimulation } from '~ez/api/cancelSimulation';
import { sendKeepalive } from '~ez/api/keepalive';
import { startBatchPolling, watchForTerminal, clearCompletionWatcher } from '~ez/api/batchPolling';
import { createMetadataPayload } from '~ez/api/updateScenarioMetadata';
import { createDraft, updateDraft, deleteDraft, fetchDraft } from '~ez/api/draft';
import { buildCurrentInput } from '~ez/exitHandler';
import { CopyRequestIdButton, copyToClipboard } from '~ez/components/CopyRequestIdButton';
import { EZFeedbackModal } from '~ez/components/EZFeedbackModal';
import { createModalPresets } from '~ez/components/modalPresets';
import { isProcessState } from '~ez/stores/types';
import type { HookAPI } from 'antd/es/modal/useModal';
import type { MessageInstance } from 'antd/es/message/interface';
import type { BackgroundSimStatus, BackgroundSimulation } from '~stores/batch';
import { restoreStoresFromInput } from '~ez/api/fetchScenarioInput';
import { fetchScenarioPreamble } from '~ez/api/fetchScenarioPreamble';
import { fetchScenarioStatus } from '~ez/api/scenarioStatus';
import '~ez/locales';
import '~ez/components/locales';
import styles from './header.module.less';

const INPUT_STATES = [
  'SELECT_PARAMETERS',
  'VIEW_PARAMETERS',
  'DRAW_EMISSION_ZONE',
  'EDIT_EMISSION_ZONE',
  'REDRAW_EMISSION_ZONE',
  'DRAW_SIMULATION_AREA',
  'EDIT_SIMULATION_AREA',
];

const STATUS_ICONS: Record<BackgroundSimStatus, React.ReactElement> = {
  new: <EditOutlined />,
  queued: <ClockCircleOutlined />,
  running: <LoadingOutlined spin />,
  completed: <CheckCircleOutlined />,
  error: <CloseCircleOutlined />,
  drafted: <FileOutlined />,
};

interface BatchPopoverProps {
  messageApi: MessageInstance;
  modal: HookAPI;
}

export const BatchPopover = ({ messageApi, modal }: BatchPopoverProps) => {
  const { t } = useTranslation('ez-root');
  const p = createModalPresets(t);
  const simulations = useBatchStore((s) => s.simulations);
  const activeSimId = useBatchStore((s) => s.activeSimId);

  const getIsActive = (sim: BackgroundSimulation): boolean =>
    sim.requestId === activeSimId;

  // === Dirty input / new sim gate ===

  const showDraftSaveModal = (
    onSaved: (draftId: string) => void,
    onDiscarded: () => void
  ) => {
    EZFeedbackModal(modal, {
      title: t('batch.viewWarning.title'),
      content: t('batch.viewWarning.content'),
      actions: [
        {
          label: t('batch.viewWarning.saveDraftAndView'),
          highlight: true,
          autoDestroyOnError: false,
          onClick: async () => {
            const input = buildCurrentInput();
            const session = createMetadataPayload();
            const existingDraftId = useDraftStore.getState().draftId;
            let savedDraftId: string;

            try {
              if (existingDraftId) {
                await updateDraft(existingDraftId, input, session);
                savedDraftId = existingDraftId;
              } else {
                savedDraftId = await createDraft(input, session);
              }
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : 'Failed to save draft';
              messageApi.error(errorMsg);
              throw error;
            }

            await copyToClipboard(savedDraftId);
            messageApi.success(t('ez-components:exitModal.draftSaved', { draftId: savedDraftId }));
            useBatchStore.getState().removeSimulation('');
            useBatchStore.getState().addSimulation(savedDraftId, 'drafted');
            onSaved(savedDraftId);
          },
        },
        {
          label: t('batch.viewWarning.discardAndView'),
          danger: true,
          onClick: () => {
            useBatchStore.getState().removeSimulation('');
            onDiscarded();
          },
        },
      ],
    });
  };

  const needsDraftPrompt = (): boolean => {
    const { state, sessionIntent, isInputDirty } = useEZServiceStore.getState();
    if (!INPUT_STATES.includes(state) || sessionIntent !== 'RUN_NEW_SIMULATION') return false;
    const { simulations, activeSimId } = useBatchStore.getState();
    const hasNewBatchItem = simulations.some(s => s.status === 'new');
    if (hasNewBatchItem) return true;
    const isDraftedActive = simulations.some(s => s.status === 'drafted' && s.requestId === activeSimId);
    if (isDraftedActive) return true;
    return isInputDirty;
  };

  // === Non-completed scenario handler ===

  const handleNonCompleted = (status: string, requestId: string) => {
    const setState = useEZServiceStore.getState().setState;

    if (status === 'DELETED') {
      messageApi.error(t('ez-welcome:errors.scenarioDeleted'));
      resetOutputState();
      setState('WELCOME');
      return;
    }

    EZFeedbackModal(modal, {
      title: t('batch.nonCompleted.title'),
      content: t('batch.nonCompleted.content'),
      actions: [
        {
          label: t('batch.nonCompleted.dismiss'),
          onClick: () => {
            resetOutputState();
            setState('WELCOME');
          },
        },
        {
          label: t('batch.nonCompleted.editParameters'),
          highlight: true,
          onClick: async () => {
            try {
              const preamble = await fetchScenarioPreamble(requestId);
              restoreStoresFromInput(preamble.input, preamble.session);
            } catch {
              messageApi.error(t('batch.draftRestoreFailed'));
              return;
            }
            useEZSessionStore.getState().setRequestId('');
            useEZServiceStore.getState().setSessionIntent('RUN_NEW_SIMULATION');
            resetOutputState();
            setState('SELECT_PARAMETERS');
          },
        },
      ],
    });
  };

  // === Shared transition logic ===

  const prepareTransition = async (targetRequestId: string): Promise<boolean> => {
    const currentStateSnapshot = useEZServiceStore.getState().state;
    const currentIntent = useEZServiceStore.getState().sessionIntent;

    if (needsDraftPrompt()) {
      return new Promise<boolean>((resolve) => {
        showDraftSaveModal(
          (_savedDraftId) => {
            useDraftStore.getState().reset();
            continueTransition(targetRequestId, currentStateSnapshot, currentIntent);
            resolve(true);
          },
          () => {
            continueTransition(targetRequestId, currentStateSnapshot, currentIntent);
            resolve(true);
          }
        );
      });
    }

    continueTransition(targetRequestId, currentStateSnapshot, currentIntent);
    return true;
  };

  const continueTransition = (
    targetRequestId: string,
    fromState: string,
    fromIntent: string
  ) => {
    clearCompletionWatcher();

    if (isProcessState(fromState as any)) {
      if (fromIntent === 'RUN_NEW_SIMULATION') {
        const currentRequestId = useEZSessionStore.getState().requestId;
        if (currentRequestId) {
          sendKeepalive(currentRequestId);
          const status: BackgroundSimStatus = fromState === 'PROCESS_QUEUED' ? 'queued' : 'running';
          useBatchStore.getState().addSimulation(currentRequestId, status);
          startBatchPolling();
        }
      }
      useEZSessionStore.getState().abortSseStream();
    }

    useEZSessionStore.getState().setRequestId(targetRequestId);
    useDraftStore.getState().reset();
    resetOutputState();
  };

  // === View completed sim (LOAD_PREVIOUS_SCENARIO) ===

  const handleView = async (requestId: string) => {
    const setState = useEZServiceStore.getState().setState;
    const success = await prepareTransition(requestId);
    if (!success) return;

    let currentStatus: string;
    try {
      currentStatus = (await fetchScenarioStatus(requestId)).status;
    } catch {
      messageApi.error(t('batch.simFailed'));
      setState('WELCOME');
      return;
    }

    if (currentStatus === 'DELETED' || currentStatus === 'CANCELLED' || currentStatus === 'FAILED') {
      useBatchStore.getState().updateStatus(requestId, 'error');
      handleNonCompleted(currentStatus, requestId);
      return;
    }

    useEZServiceStore.getState().setSessionIntent('LOAD_PREVIOUS_SCENARIO');
    useBatchStore.getState().setActiveSimId(requestId);

    loadScenario(requestId, setState, (errorMsg) => {
      useBatchStore.getState().updateStatus(requestId, 'error', errorMsg);
      messageApi.error(errorMsg);
      setState('WELCOME');
    });
  };

  // === Reconnect to running/queued sim (LOAD_PREVIOUS_SCENARIO + polling) ===

  const handleViewRunning = async (requestId: string) => {
    const setState = useEZServiceStore.getState().setState;
    const success = await prepareTransition(requestId);
    if (!success) return;

    useEZServiceStore.getState().setSessionIntent('LOAD_PREVIOUS_SCENARIO');
    useBatchStore.getState().setActiveSimId(requestId);
    setState('PROCESS_POLLING');

    watchForTerminal(requestId, async (status) => {
      if (useEZSessionStore.getState().requestId !== requestId) return;
      if (status === 'completed') {
        loadScenario(requestId, setState, (errorMsg) => {
          messageApi.error(errorMsg);
          setState('WELCOME');
        });
        return;
      }

      let backendStatus: string;
      try {
        backendStatus = (await fetchScenarioStatus(requestId)).status;
      } catch {
        const errorMsg = useBatchStore.getState().simulations
          .find(s => s.requestId === requestId)?.errorMessage;
        messageApi.error(errorMsg || t('batch.simFailed'));
        resetOutputState();
        setState('WELCOME');
        return;
      }
      handleNonCompleted(backendStatus, requestId);
    });
  };

  // === View draft (RUN_NEW_SIMULATION) ===

  const handleViewDraft = async (draftId: string) => {
    const setState = useEZServiceStore.getState().setState;
    const success = await prepareTransition(draftId);
    if (!success) return;

    let draftData: Awaited<ReturnType<typeof fetchDraft>>;
    try {
      draftData = await fetchDraft(draftId);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : t('batch.draftLoadFailed');
      messageApi.error(errorMsg);
      return;
    }

    try {
      restoreStoresFromInput(draftData.inputData, draftData.sessionData);
      useDraftStore.getState().setDraftId(draftId);
      useEZSessionStore.getState().setRequestId('');
      useEZServiceStore.getState().setSessionIntent('RUN_NEW_SIMULATION');
      useBatchStore.getState().setActiveSimId(draftId);
      setState('VIEW_PARAMETERS');
    } catch {
      messageApi.error(t('batch.draftRestoreFailed'));
    }
  };

  // === Dismiss ===

  const handleDismiss = async (sim: BackgroundSimulation) => {
    if (sim.status === 'new') {
      useBatchStore.getState().removeSimulation('');
      return;
    }

    if (sim.status === 'drafted') {
      try {
        await deleteDraft(sim.requestId);
      } catch {
        // Best effort
      }
      useBatchStore.getState().removeSimulation(sim.requestId);
      return;
    }

    if (sim.status === 'completed' || sim.status === 'error') {
      showRemoveConfirmModal(sim.requestId);
    } else if (sim.status === 'queued' || sim.status === 'running') {
      showCancelConfirmModal(sim.requestId);
    }
  };

  const showRemoveConfirmModal = (requestId: string) => {
    EZFeedbackModal(modal, {
      title: t('batch.removeConfirm.title'),
      content: t('batch.removeConfirm.content'),
      actions: [
        p.keep(),
        p.confirm(() => {
          useBatchStore.getState().removeSimulation(requestId);
        }),
      ],
    });
  };

  const showCancelConfirmModal = (requestId: string) => {
    EZFeedbackModal(modal, {
      title: t('batch.dismissConfirm.title'),
      content: t('batch.dismissConfirm.content'),
      actions: [
        p.keep(),
        {
          label: t('batch.dismissConfirm.confirm'),
          danger: true,
          onClick: async () => {
            const result = await cancelSimulation(requestId);

            if (result === 'success' || result === 'not_found' || result === 'conflict') {
              useBatchStore.getState().removeSimulation(requestId);
            } else {
              messageApi.error(t('batch.dismissConfirm.cancelFailed'));
            }
          },
        },
      ],
    });
  };

  const showErrorModal = (errorMessage: string) => {
    EZFeedbackModal(modal, {
      title: t('batch.errorModal.title'),
      content: errorMessage,
      actions: [
        p.keep(),
      ],
    });
  };

  // === Render ===

  const renderSimRow = (sim: BackgroundSimulation, isActive: boolean) => {
    const isNew = sim.status === 'new';
    const displayId = isNew && !sim.requestId
      ? t('batch.status.new')
      : sim.requestId;

    return (
      <div
        key={sim.requestId}
        className={`${styles.batchSimItem} ${isActive ? styles.batchSimItem_active : ''}`}
      >
        <Tooltip title={t('batch.dismissButton')}>
          <button
            className={styles.batchDismissButton}
            disabled={isActive}
            onClick={() => handleDismiss(sim)}
          >
            <CloseOutlined />
          </button>
        </Tooltip>
        <span className={styles[`batchStatus_${sim.status}`]}>
          {STATUS_ICONS[sim.status]}
        </span>
        <span className={styles.batchSimRequestId} title={displayId}>
          {displayId}
        </span>
        <div className={styles.batchSimActions}>
          {(sim.status === 'running' || sim.status === 'completed' || sim.status === 'drafted') && (
            <CopyRequestIdButton
              requestId={sim.requestId}
              messageApi={messageApi}
              showText={false}
              size="small"
              type="text"
              tooltipText={sim.status === 'drafted' ? t('batch.copyDraftId') : undefined}
              className={styles.batchCopyButton}
            />
          )}
          {sim.status === 'completed' && (
            <Tooltip title={t('batch.viewButton')}>
              <Button
                size="small"
                type="text"
                icon={<LoginOutlined />}
                disabled={isActive}
                onClick={() => handleView(sim.requestId)}
              />
            </Tooltip>
          )}
          {sim.status === 'drafted' && (
            <Tooltip title={t('batch.viewButton')}>
              <Button
                size="small"
                type="text"
                icon={<LoginOutlined />}
                disabled={isActive}
                onClick={() => handleViewDraft(sim.requestId)}
              />
            </Tooltip>
          )}
          {(sim.status === 'running' || sim.status === 'queued') && (
            <Tooltip title={t('batch.reconnectButton')}>
              <Button
                size="small"
                type="text"
                icon={<LoginOutlined />}
                disabled={isActive}
                onClick={() => handleViewRunning(sim.requestId)}
              />
            </Tooltip>
          )}
          {sim.status === 'error' && sim.errorMessage && (
            <Tooltip title={t('batch.viewErrorButton')}>
              <Button
                size="small"
                type="text"
                icon={<ExclamationCircleOutlined />}
                onClick={() => showErrorModal(sim.errorMessage!)}
              />
            </Tooltip>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.batchPopoverList}>
      {simulations.map((sim) => renderSimRow(sim, getIsActive(sim)))}
    </div>
  );
};
