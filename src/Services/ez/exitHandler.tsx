import i18n from '~i18nConfig';
import type { HookAPI } from 'antd/es/modal/useModal';
import type { MessageInstance } from 'antd/es/message/interface';
import '~ez/locales';
import './components/locales';
import { useEZServiceStore, useAPIPayloadStore, useDrawToolStore } from '~store';
import { useEZSessionStore, useDraftStore, createInitialSessionState } from '~stores/session';
import { resetAllEZStores } from '~stores/reset';
import { useBatchStore } from '~stores/batch';
import { isProcessState } from '~stores/types';
import type { SessionState, MainInputPayload } from '~stores/types';
import { EZFeedbackModal } from './components/EZFeedbackModal';
import { createModalPresets } from './components/modalPresets';
import { copyToClipboard } from './components/CopyRequestIdButton';
import { createDraft, updateDraft } from './api/draft';
import { createMetadataPayload } from './api/updateScenarioMetadata';
import { cancelSimulation } from './api/cancelSimulation';
import { INITIAL_PAYLOAD, DEFAULT_ZONE_ID } from '~stores/defaults';

const t = i18n.t.bind(i18n);
const p = createModalPresets(t);

// ===== INPUT CHANGE DETECTION =====

// Checks if input has changed from default state (used by ParameterSelectionView)
export const hasInputChangedFromDefault = (): boolean => {
  const payload = useAPIPayloadStore.getState().payload;
  const drawToolGeoJson = useDrawToolStore.getState().drawToolGeoJson;
  const sessionStore = useEZSessionStore.getState();
  const sessionDefaults = createInitialSessionState();

  if (payload.zones.some(z => z.coords !== null && z.coords.length > 0)) return true;
  if (payload.zones.length !== INITIAL_PAYLOAD.zones.length) return true;
  if (payload.zones.some(z => z.policies && z.policies.length > 0)) return true;
  if (payload.zones.some(z => z.trip.length !== 1 || z.trip[0] !== 'start')) return true;
  if (payload.customSimulationAreas.length > 0 || payload.scaledSimulationAreas.length > 0) return true;
  if (JSON.stringify(payload.carDistribution) !== JSON.stringify(INITIAL_PAYLOAD.carDistribution)) return true;
  if (JSON.stringify(payload.modeUtilities) !== JSON.stringify(INITIAL_PAYLOAD.modeUtilities)) return true;
  if (JSON.stringify(payload.simulationOptions) !== JSON.stringify(INITIAL_PAYLOAD.simulationOptions)) return true;
  if (JSON.stringify(payload.sources) !== JSON.stringify(INITIAL_PAYLOAD.sources)) return true;
  if (drawToolGeoJson.features.length > 0) return true;
  if (sessionStore.scenarioTitle !== sessionDefaults.scenarioTitle) return true;
  if (sessionStore.scenarioDescription !== sessionDefaults.scenarioDescription) return true;
  if (sessionStore.zones[DEFAULT_ZONE_ID]?.name !== sessionDefaults.zones[DEFAULT_ZONE_ID]?.name) return true;

  return false;
};

// ===== HELPERS =====

export function buildCurrentInput(): MainInputPayload {
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

async function performExit(onExit: () => void): Promise<void> {
  try {
    await resetAllEZStores();
  } finally {
    useEZServiceStore.getState().setIsExiting(false);
    onExit();
  }
}

const INPUT_STATES: SessionState[] = [
  'SELECT_PARAMETERS',
  'VIEW_PARAMETERS',
  'DRAW_EMISSION_ZONE',
  'EDIT_EMISSION_ZONE',
  'REDRAW_EMISSION_ZONE',
  'DRAW_SIMULATION_AREA',
  'EDIT_SIMULATION_AREA',
];

// ===== SHARED VIEW_RESULTS EXIT =====

function handleViewResultsExit(
  modal: HookAPI,
  messageApi: MessageInstance,
  onExit: () => void,
  requestId: string
) {
  const hasRequestId = requestId && requestId.trim() !== '';
  const pinned = useEZSessionStore.getState().pinned;
  const contentKey = pinned
    ? 'ez-components:exitModal.content.newResultsPinned'
    : 'ez-components:exitModal.content.newResultsUnpinned';

  const dismissModal = () => {
    useEZServiceStore.getState().setIsExiting(false);
  };

  EZFeedbackModal(modal, {
    title: t('ez-components:exitModal.title'),
    content: buildExitContent(t(contentKey)),
    closable: true,
    onClose: dismissModal,
    actions: [
      ...(hasRequestId ? [p.copyRequestId(async () => {
        try {
          await copyToClipboard(requestId);
          messageApi.success(t('ez-components:copyRequestId.copiedSuccess'));
        } catch {
          messageApi.error(t('ez-components:copyRequestId.copyFailed'));
        }
      })] : []),
      p.exit(() => performExit(onExit)),
    ],
  });
}

// ===== INTENT HANDLERS =====

function handleOfflineExit(modal: HookAPI, messageApi: MessageInstance, onExit: () => void, requestId: string) {
  const hasRequestId = requestId && requestId.trim() !== '';

  const dismissModal = () => {
    useEZServiceStore.getState().setIsExiting(false);
  };

  EZFeedbackModal(modal, {
    title: t('ez-components:exitModal.title'),
    content: t('ez-components:exitModal.content.offline'),
    closable: true,
    onClose: dismissModal,
    actions: [
      ...(hasRequestId ? [p.copyRequestId(async () => {
        try {
          await copyToClipboard(requestId);
          messageApi.success(t('ez-components:copyRequestId.copiedSuccess'));
        } catch {
          messageApi.error(t('ez-components:copyRequestId.copyFailed'));
        }
      })] : []),
      p.exit(() => performExit(onExit)),
    ],
  });
}

function handleDemoExit(modal: HookAPI, onExit: () => void) {
  const dismissModal = () => {
    useEZServiceStore.getState().setIsExiting(false);
  };

  EZFeedbackModal(modal, {
    title: t('ez-components:exitModal.title'),
    content: t('ez-components:exitModal.content.demo'),
    closable: true,
    onClose: dismissModal,
    actions: [
      p.exit(() => performExit(onExit)),
    ],
  });
}

function handlePreviousScenarioExit(
  modal: HookAPI,
  messageApi: MessageInstance,
  onExit: () => void,
  state: SessionState,
  requestId: string,
  isInputDirty: boolean
) {
  if (state === 'VIEW_RESULTS') {
    handleViewResultsExit(modal, messageApi, onExit, requestId);
    return;
  }

  const hasRequestId = requestId && requestId.trim() !== '';
  const isDirtyViewParams = state === 'VIEW_PARAMETERS' && isInputDirty;

  const content = isDirtyViewParams
    ? t('ez-components:exitModal.content.scenarioDirty')
    : t('ez-components:exitModal.content.scenario');

  const dismissModal = () => {
    useEZServiceStore.getState().setIsExiting(false);
  };

  EZFeedbackModal(modal, {
    title: t('ez-components:exitModal.title'),
    content,
    closable: true,
    onClose: dismissModal,
    actions: [
      ...(hasRequestId ? [p.copyRequestId(async () => {
        try {
          await copyToClipboard(requestId);
          messageApi.success(t('ez-components:copyRequestId.copiedSuccess'));
        } catch {
          messageApi.error(t('ez-components:copyRequestId.copyFailed'));
        }
      })] : []),
      ...(isDirtyViewParams ? [p.saveDraftAndExit(async () => {
        try {
          const input = buildCurrentInput();
          const session = createMetadataPayload();
          const draftId = useDraftStore.getState().draftId;
          let savedDraftId: string;

          if (draftId) {
            await updateDraft(draftId, input, session);
            savedDraftId = draftId;
          } else {
            savedDraftId = await createDraft(input, session);
          }

          await copyToClipboard(savedDraftId);
          messageApi.success(t('ez-components:exitModal.draftSaved', { draftId: savedDraftId }));
          await performExit(onExit);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : t('ez-components:exitModal.draftError');
          messageApi.error(errorMsg);
          useEZServiceStore.getState().setIsExiting(false);
        }
      })] : []),
      p.exit(() => performExit(onExit)),
    ],
  });
}

function buildExitContent(baseContent: string): string {
  const batch = useBatchStore.getState();
  if (!batch.isBatchMode) return baseContent;

  const hasActiveWork = batch.simulations.some(
    (s) => s.status === 'running' || s.status === 'queued'
  );
  const batchWarning = hasActiveWork
    ? t('ez-components:exitModal.batchWarning')
    : t('ez-components:exitModal.batchWarningIdle');

  return `${baseContent}\n\n${batchWarning}`;
}

function handleNewSimulationExit(
  modal: HookAPI,
  messageApi: MessageInstance,
  onExit: () => void,
  state: SessionState,
  requestId: string
) {
  const hasRequestId = requestId && requestId.trim() !== '';

  // VIEW_RESULTS - shared exit modal
  if (state === 'VIEW_RESULTS') {
    handleViewResultsExit(modal, messageApi, onExit, requestId);
    return;
  }

  // Process states - copy ID & exit (fire-and-forget) + cancel & exit
  if (isProcessState(state)) {
    const dismissModal = () => {
      useEZServiceStore.getState().setIsExiting(false);
    };

    EZFeedbackModal(modal, {
      title: t('ez-components:exitModal.title'),
      content: buildExitContent(t('ez-components:exitModal.content.newProcess')),
      closable: true,
      onClose: dismissModal,
      actions: [
        p.copyAndExit(async () => {
          if (hasRequestId) {
            try {
              await copyToClipboard(requestId);
              messageApi.success(t('ez-components:copyRequestId.copiedSuccess'));
            } catch {
              // Copy failed - still exit
            }
          }
          // Clear SSE cleanup so resetAllEZStores skips cancel (fire-and-forget)
          useEZSessionStore.getState().setSseCleanup(null);
          await performExit(onExit);
        }),
        p.cancelAndExit(async () => {
          try {
            useEZSessionStore.getState().abortSseStream();
            if (hasRequestId) {
              await cancelSimulation(requestId);
            }
          } catch {
            // Cancel failed - still exit
          }
          await performExit(onExit);
        }),
      ],
    });
    return;
  }

  // Input states - save draft & exit + exit
  if (INPUT_STATES.includes(state)) {
    const dismissModal = () => {
      useEZServiceStore.getState().setIsExiting(false);
    };

    EZFeedbackModal(modal, {
      title: t('ez-components:exitModal.title'),
      content: buildExitContent(t('ez-components:exitModal.content.newInput')),
      closable: true,
      onClose: dismissModal,
      actions: [
        p.saveDraftAndExit(async () => {
          try {
            const input = buildCurrentInput();
            const session = createMetadataPayload();
            const draftId = useDraftStore.getState().draftId;
            let savedDraftId: string;

            if (draftId) {
              await updateDraft(draftId, input, session);
              savedDraftId = draftId;
            } else {
              savedDraftId = await createDraft(input, session);
            }

            await copyToClipboard(savedDraftId);
            messageApi.success(t('ez-components:exitModal.draftSaved', { draftId: savedDraftId }));
            await performExit(onExit);
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : t('ez-components:exitModal.draftError');
            messageApi.error(errorMsg);
            useEZServiceStore.getState().setIsExiting(false);
          }
        }),
        p.exit(() => performExit(onExit)),
      ],
    });
    return;
  }

  // Fallback (WELCOME or unexpected state) - just exit
  EZFeedbackModal(modal, {
    title: t('ez-components:exitModal.title'),
    content: t('ez-components:exitModal.content.demo'),
    actions: [
      p.exit(() => performExit(onExit)),
    ],
  });
}

// ===== MAIN EXIT HANDLER =====

export function handleExit(
  modal: HookAPI,
  messageApi: MessageInstance,
  onExit: () => void
): void {
  const { state, sessionIntent, isExiting, isInputDirty } = useEZServiceStore.getState();
  const requestId = useEZSessionStore.getState().requestId;

  if (isExiting) return;
  useEZServiceStore.getState().setIsExiting(true);

  switch (sessionIntent) {
    case 'VIEW_SCENARIO_OFFLINE':
      handleOfflineExit(modal, messageApi, onExit, requestId);
      break;

    case 'LOAD_DEMO_SCENARIO':
      handleDemoExit(modal, onExit);
      break;

    case 'LOAD_PREVIOUS_SCENARIO':
      handlePreviousScenarioExit(modal, messageApi, onExit, state, requestId, isInputDirty);
      break;

    case 'RUN_NEW_SIMULATION':
      handleNewSimulationExit(modal, messageApi, onExit, state, requestId);
      break;
  }
}
