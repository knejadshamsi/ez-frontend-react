import { Space, Button, Input, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import type { MessageInstance } from 'antd/es/message/interface'
import type { NotificationInstance } from 'antd/es/notification/interface'
import type { HookAPI } from 'antd/es/modal/useModal'
import { useEZSessionStore, useDraftStore } from '~stores/session'
import { useEZServiceStore, useAPIPayloadStore } from '~store'
import { loadScenario } from '~ez/api'
import { resetOutputState } from '~stores/reset'
import { restoreStoresFromInput } from '~ez/api/fetchScenarioInput'
import { fetchDraft } from '~ez/api/draft'
import { fetchScenarioStatus } from '~ez/api/scenarioStatus'
import { fetchScenarioPreamble } from '~ez/api/fetchScenarioPreamble'
import { EZFeedbackModal } from '~ez/components/EZFeedbackModal'
import previousScenarios from './previousScenarios.json'
import './locales'
import styles from './WelcomeView.module.less'

const { Text } = Typography

interface WelcomeViewProps {
  messageApi: MessageInstance;
  notificationApi: NotificationInstance;
  modal: HookAPI;
}

export const WelcomeView = ({ messageApi, notificationApi, modal }: WelcomeViewProps) => {
  const { t } = useTranslation('ez-welcome');
  const showError = (msg: string) => messageApi.error(msg);
  const requestId = useEZSessionStore((state) => state.requestId)
  const setRequestId = useEZSessionStore((state) => state.setRequestId)
  const setState = useEZServiceStore((state) => state.setState)
  const setSessionIntent = useEZServiceStore((state) => state.setSessionIntent)
  const connectionState = useEZServiceStore((state) => state.connectionState)
  const isFullConnect = connectionState === 'FULL_CONNECT'

  const handleScenarioLoadError = (errorMessage: string) => {
    showError(errorMessage || t('errors.loadFailed'));
    setState('WELCOME');
  };

  const showNonCompletedModal = (scenarioRequestId: string, status: string) => {
    const statusLabel = status === 'CANCELLED'
      ? t('status.cancelled')
      : t('status.failed');

    EZFeedbackModal(modal, {
      title: t('nonCompleted.title'),
      content: t('nonCompleted.content', { status: statusLabel }),
      actions: [
        {
          label: t('nonCompleted.dismissText'),
        },
        {
          label: t('nonCompleted.cancelText'),
          onClick: () => {
            useEZServiceStore.getState().setSessionIntent('RUN_NEW_SIMULATION');
            useEZSessionStore.getState().setRequestId('');
            resetOutputState();
            useDraftStore.getState().reset();
            useAPIPayloadStore.getState().reset();
            useEZSessionStore.getState().reset();
            setState('SELECT_PARAMETERS');
          },
        },
        {
          label: t('nonCompleted.okText'),
          highlight: true,
          onClick: async () => {
            const preamble = await fetchScenarioPreamble(scenarioRequestId);
            useEZServiceStore.getState().setSessionIntent('RUN_NEW_SIMULATION');
            restoreStoresFromInput(preamble.input, preamble.session);
            useEZSessionStore.getState().setRequestId('');
            setState('SELECT_PARAMETERS');
          },
        },
      ],
    });
  };

  // CLICK HANDLING

  const loadScenarioWithStatusCheck = async (scenarioRequestId: string) => {
    try {
      const { status } = await fetchScenarioStatus(scenarioRequestId);

      if (status === 'DELETED') {
        showError(t('errors.scenarioDeleted'));
        return;
      }

      if (status === 'CANCELLED' || status === 'FAILED') {
        showNonCompletedModal(scenarioRequestId, status);
        return;
      }

      // COMPLETED (or other active statuses) - load via SSE stream
      await loadScenario(scenarioRequestId, setState, handleScenarioLoadError);
    } catch {
      showError(t('errors.loadFailed'));
    }
  };

  const handleViewScenario = async (scenarioRequestId: string) => {
    if (!scenarioRequestId || scenarioRequestId.trim() === '') {
      showError(t('errors.invalidId'));
      return;
    }

    setSessionIntent('LOAD_PREVIOUS_SCENARIO');
    setRequestId(scenarioRequestId);
    await loadScenarioWithStatusCheck(scenarioRequestId);
  }

  const handleCreateScenario = () => {
    const isOffline = connectionState === 'FULL_DISCONNECT' || connectionState === 'HALF_DISCONNECT';
    setSessionIntent(isOffline ? 'LOAD_DEMO_SCENARIO' : 'RUN_NEW_SIMULATION');
    setRequestId('');
    resetOutputState();
    useDraftStore.getState().reset();
    useAPIPayloadStore.getState().reset();
    useEZSessionStore.getState().reset();
    setState('SELECT_PARAMETERS');
  }

  const loadDraftScenario = async (draftId: string) => {
    let draft: Awaited<ReturnType<typeof fetchDraft>>;
    try {
      draft = await fetchDraft(draftId);
    } catch (error) {
      console.error('[Load Draft] Fetch failed:', error);
      const errorMsg = error instanceof Error ? error.message : t('errors.draftLoadFailed');
      showError(errorMsg);
      return;
    }

    try {
      restoreStoresFromInput(draft.inputData, draft.sessionData);
      useDraftStore.getState().setDraftId(draftId);
      setRequestId('');
      setState('SELECT_PARAMETERS');
    } catch (error) {
      console.error('[Load Draft] Restore failed:', error);
      showError(t('errors.draftRestoreFailed'));
    }
  };

  const handleViewPreviousScenario = async () => {
    if (!requestId || requestId.trim() === '') {
      showError(t('errors.enterValidId'));
      return;
    }

    setSessionIntent('LOAD_PREVIOUS_SCENARIO');
    if (requestId.startsWith('d_')) {
      await loadDraftScenario(requestId);
    } else {
      await loadScenarioWithStatusCheck(requestId);
    }
  }


  return (
    <div className={styles.container}>
      <div className={styles.welcomeText}>
        <br />
        {t('welcome.title')}
        <strong>{t('welcome.titleBold')}</strong>
        {t('welcome.titleEnd')}
        <br />
        <br />
        {t('welcome.subtitle')}
      </div>

      <div className={styles.scenarioListContainer}>
        <Text className={styles.scenarioListTitle}>{t('previousScenarios.title')}</Text>
        <div className={styles.scenarioList}>
          {previousScenarios.map((scenario) => (
            <div key={scenario.requestId} className={styles.scenarioItem}>
              <div className={styles.scenarioItemTitle}>
                {t(`scenarios.${scenario.requestId}.name`)}
              </div>
              <div className={styles.scenarioItemDescription}>
                {t(`scenarios.${scenario.requestId}.description`)}
              </div>
              <div className={styles.scenarioItemButton}>
                <Button type="primary" disabled={!isFullConnect} onClick={() => handleViewScenario(scenario.requestId)}>
                  {t('previousScenarios.viewButton')}
                </Button>
              </div>
            </div>
          ))}
          <div className={styles.bottomSpacer}></div>
        </div>
      </div>

      <div className={styles.bottomControls}>
        <Space direction="vertical" className={styles.fullWidth}>
          <Space.Compact className={styles.fullWidth}>
            <Input
              placeholder={t('input.placeholder')}
              className={styles.flexInput}
              value={requestId || ''}
              onChange={(e) => setRequestId(e.target.value)}
              disabled={!isFullConnect}
              onPressEnter={() => {
                if (isFullConnect && requestId && requestId.trim() !== '') {
                  handleViewPreviousScenario()
                }
              }}
            />
            <Button
              type="primary"
              disabled={!isFullConnect || !requestId || requestId.trim() === ''}
              onClick={handleViewPreviousScenario}
            >
              {t('buttons.viewPrevious')}
            </Button>
          </Space.Compact>
          <Button
            type="link"
            className={styles.linkButton}
            onClick={handleCreateScenario}
          >
            {t('buttons.createNew')}
          </Button>
        </Space>
      </div>
    </div>
  )
}
