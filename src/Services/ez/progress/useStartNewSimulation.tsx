import { useState } from 'react';
import { Input } from 'antd';
import { useTranslation } from 'react-i18next';
import { useEZFeedback } from '~ez/components/EZFeedback';
import { useEZServiceStore, useAPIPayloadStore } from '~store';
import { useEZSessionStore, useDraftStore } from '~stores/session';
import { useBatchStore } from '~stores/batch';
import { resetOutputState } from '~stores/reset';
import { fetchDraft } from '~ez/api/draft';
import { restoreStoresFromInput } from '~ez/api/fetchScenarioInput';
import { startBatchPolling } from '~ez/api/batchPolling';
import { sendKeepalive } from '~ez/api/keepalive';
import styles from './Progress.module.less';
import './locales';

function mapProcessStateToStatus(): 'queued' | 'running' {
  const state = useEZServiceStore.getState().state;
  return state === 'PROCESS_QUEUED' ? 'queued' : 'running';
}

async function backgroundAndStart(
  mode: 'fresh' | 'existing' | 'draft',
  showError: (msg: string) => void,
  t: (key: string) => string,
  draftId?: string,
): Promise<boolean> {
  const requestId = useEZSessionStore.getState().requestId;
  const status = mapProcessStateToStatus();

  // For draft mode, fetch first - if it fails, SSE stays alive
  let draftData: Awaited<ReturnType<typeof fetchDraft>> | undefined;
  if (mode === 'draft') {
    if (!draftId) return false;
    try {
      draftData = await fetchDraft(draftId);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : t('batch.modal.draftLoadFailed');
      showError(errorMsg);
      return false;
    }
  }

  // 1. Keepalive before disconnecting (best-effort)
  await sendKeepalive(requestId);

  // 2. Disconnect SSE
  useEZSessionStore.getState().abortSseStream();

  // 3. Add to batch store
  useBatchStore.getState().addSimulation(requestId, status);

  // 4. Reset output/progress stores (NOT batch store)
  resetOutputState();

  // 5. Clear requestId so old sim doesn't show as active in batch list
  useEZSessionStore.getState().setRequestId('');

  // 6. Transition based on mode
  const setState = useEZServiceStore.getState().setState;

  switch (mode) {
    case 'fresh': {
      useDraftStore.getState().reset();
      useAPIPayloadStore.getState().reset();
      useEZSessionStore.getState().reset();
      useBatchStore.getState().addSimulation('', 'new');
      setState('SELECT_PARAMETERS');
      break;
    }
    case 'existing': {
      useBatchStore.getState().addSimulation('', 'new');
      setState('SELECT_PARAMETERS');
      break;
    }
    case 'draft': {
      try {
        restoreStoresFromInput(draftData!.inputData, draftData!.sessionData);
        useDraftStore.getState().setDraftId(draftId!);
        useBatchStore.getState().addSimulation(draftId!, 'drafted');
      } catch {
        showError(t('batch.modal.draftRestoreFailed'));
        useDraftStore.getState().reset();
        useAPIPayloadStore.getState().reset();
        useEZSessionStore.getState().reset();
        useBatchStore.getState().addSimulation('', 'new');
      }
      useEZSessionStore.getState().setRequestId('');
      setState('SELECT_PARAMETERS');
      break;
    }
  }

  // 7. Start polling for background simulations
  startBatchPolling();

  return true;
}

// Draft input rendered inside the draft modal content
const DraftInput = ({ valueRef, t }: { valueRef: { current: string }; t: (key: string) => string }) => {
  const [draftId, setDraftId] = useState(valueRef.current);

  return (
    <div className={styles.draftInputRow}>
      <Input
        placeholder={t('batch.modal.draftIdPlaceholder')}
        value={draftId}
        onChange={(e) => {
          setDraftId(e.target.value);
          valueRef.current = e.target.value;
        }}
      />
    </div>
  );
};

interface UseStartNewSimulationReturn {
  handleStartNew: () => void;
  contextHolder: React.ReactElement;
}

export const useStartNewSimulation = (): UseStartNewSimulationReturn => {
  const { t } = useTranslation('ez-progress');
  const { ezFeedback, contextHolder } = useEZFeedback();

  const showError = (msg: string) => ezFeedback.toast({ type: 'error', message: msg });

  const showDraftModal = () => {
    const draftIdRef = { current: '' };

    ezFeedback.modal({
      title: t('batch.modal.title'),
      content: (
        <DraftInput
          valueRef={draftIdRef}
          t={t}
        />
      ),
      closable: true,
      onClose: showMainModal,
      actions: [
        {
          label: t('batch.modal.back'),
          onClick: showMainModal,
        },
        {
          label: t('batch.modal.loadDraft'),
          highlight: true,
          autoDestroyOnError: false,
          onClick: async () => {
            if (!draftIdRef.current.trim()) {
              showError(t('batch.modal.draftLoadFailed'));
              throw new Error('empty');
            }
            const success = await backgroundAndStart('draft', showError, t, draftIdRef.current.trim());
            if (!success) throw new Error('failed');
          },
        },
      ],
    });
  };

  const showMainModal = () => {
    ezFeedback.modal({
      title: t('batch.modal.title'),
      content: t('batch.modal.content'),
      actions: [
        {
          label: t('batch.modal.startFresh'),
          onClick: async () => {
            await backgroundAndStart('fresh', showError, t);
          },
        },
        {
          label: t('batch.modal.keepInputs'),
          onClick: async () => {
            await backgroundAndStart('existing', showError, t);
          },
        },
        {
          label: t('batch.modal.loadFromDraft'),
          onClick: showDraftModal,
        },
      ],
    });
  };

  const handleStartNew = () => showMainModal();

  return { handleStartNew, contextHolder };
};
