import { Space, Button, Input, Typography, message, Modal } from 'antd'
import { showEZModal } from '~ez/components/EZModal'
import { useTranslation } from 'react-i18next'
import { useEZSessionStore, useDraftStore } from '~stores/session'
import { useEZServiceStore, useAPIPayloadStore } from '~store'
import { loadScenario } from '~ez/api'
import { resetOutputState } from '~stores/reset'
import { useScenarioSnapshotStore } from '~stores/scenario'
import { restoreStoresFromInput } from '~ez/api/fetchScenarioInput'
import { fetchDraft } from '~ez/api/draft'
import previousScenarios from './previousScenarios.json'
import './locales'
import styles from './WelcomeView.module.less'

const { Text } = Typography

export const WelcomeView = () => {
  const { t } = useTranslation('ez-welcome');
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();

  const requestId = useEZSessionStore((state) => state.requestId)
  const setRequestId = useEZSessionStore((state) => state.setRequestId)
  const setState = useEZServiceStore((state) => state.setState)

  const handleScenarioLoadError = (errorMessage: string) => {
    messageApi.error(errorMessage || t('errors.loadFailed'));
    setState('WELCOME');
  };

  const handleNonCompleted = (status: string) => {
    if (status === 'DELETED') {
      messageApi.error(t('errors.scenarioDeleted'));
      setState('WELCOME');
      resetOutputState();
      return;
    }

    // CANCELLED or FAILED
    const statusLabel = status === 'CANCELLED' ? t('status.cancelled') : t('status.failed');

    const instance = showEZModal(modal, {
      title: t('nonCompleted.title'),
      content: t('nonCompleted.content', { status: statusLabel }),
      actions: [
        {
          label: t('nonCompleted.cancelText'),
          onClick: () => {
            resetOutputState();
            setState('WELCOME');
            instance.destroy();
          },
        },
        {
          label: t('nonCompleted.okText'),
          type: 'primary',
          onClick: () => {
            const snapshot = useScenarioSnapshotStore.getState();
            if (snapshot.input) {
              restoreStoresFromInput(snapshot.input, snapshot.session);
            }
            setRequestId('');
            resetOutputState();
            setState('PARAMETER_SELECTION');
            instance.destroy();
          },
        },
      ],
    });
  };

  // CLICK HANDLING

  const handleViewScenario = async (scenarioRequestId: string) => {
    if (!scenarioRequestId || scenarioRequestId.trim() === '') {
      messageApi.error(t('errors.invalidId'));
      return;
    }

    setRequestId(scenarioRequestId);
    await loadScenario(scenarioRequestId, setState, handleScenarioLoadError, handleNonCompleted);
  }

  const handleCreateScenario = () => {
    // Clean slate — clear any lingering data from previous scenarios
    setRequestId('');
    resetOutputState();
    useDraftStore.getState().reset();
    useAPIPayloadStore.getState().reset();
    useEZSessionStore.getState().reset();
    setState('PARAMETER_SELECTION');
  }

  const loadDraftScenario = async (draftId: string) => {
    try {
      const draft = await fetchDraft(draftId);
      restoreStoresFromInput(
        draft.inputData,
        draft.sessionData
      );
      useDraftStore.getState().setDraftId(draftId);
      setRequestId('');
      setState('PARAMETER_SELECTION');
    } catch (error) {
      console.error('[Load Draft] Failed:', error);
      const errorMsg = error instanceof Error ? error.message : t('errors.draftLoadFailed');
      messageApi.error(errorMsg);
    }
  };

  const handleViewPreviousScenario = async () => {
    if (!requestId || requestId.trim() === '') {
      messageApi.error(t('errors.enterValidId'));
      return;
    }

    if (requestId.startsWith('d_')) {
      await loadDraftScenario(requestId);
    } else {
      await loadScenario(requestId, setState, handleScenarioLoadError, handleNonCompleted);
    }
  }


  return (
    <div className={styles.container}>
      {contextHolder}
      {modalContextHolder}
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
                <Button type="primary" onClick={() => handleViewScenario(scenario.requestId)}>
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
              style={{ flex: 1 }}
              value={requestId || ''}
              onChange={(e) => setRequestId(e.target.value)}
              onPressEnter={() => {
                if (requestId && requestId.trim() !== '') {
                  handleViewPreviousScenario()
                }
              }}
            />
            <Button
              type="primary"
              disabled={!requestId || requestId.trim() === ''}
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
