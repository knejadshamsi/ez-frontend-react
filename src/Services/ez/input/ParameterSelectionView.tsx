import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useEZSessionStore } from '~stores/session'
import { useAPIPayloadStore, useEZServiceStore } from '~store'

import { InputContainer } from './inputContainer'
import { createAPIRequest, validateAPIRequest, startSimulation } from '~ez/api'
import { hasOutputData, resetAllEZOutputStores } from '~stores/output'
import { resetAllEZStores } from '~stores/reset'
import { hasInputChangedFromDefault } from '~ez/exitHandler'
import { useScenarioSnapshotStore, hasInputChanged } from '~stores/scenario'

import { Button, Input, Modal, message } from 'antd'
import { ArrowLeftOutlined, SendOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons'
import { showEZModal } from '~ez/components/EZModal'
import '~ez/locales'

import styles from './ParameterSelectionView.module.less'

const MAX_NAME_LENGTH = 50;

export const ParameterSelectionView = () => {
  const { t } = useTranslation('ez-root');
  const [modal, contextHolder] = Modal.useModal();
  const [messageApi, messageContextHolder] = message.useMessage();

  const setState = useEZServiceStore((state) => state.setState)
  const isEzBackendAlive = useEZServiceStore((state) => state.isEzBackendAlive)
  const scenarioTitle = useEZSessionStore((state) => state.scenarioTitle)
  const scenarioDescription = useEZSessionStore((state) => state.scenarioDescription)
  const setScenarioTitle = useEZSessionStore((state) => state.setScenarioTitle)
  const setIsNewSimulation = useEZSessionStore((state) => state.setIsNewSimulation)

  const apiPayload = useAPIPayloadStore(state => state.payload)

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(scenarioTitle);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    setEditedTitle(scenarioTitle);
  }, [scenarioTitle]);

  const handleSimulationError = (errorMessage: string) => {
    messageApi.error(errorMessage || 'Simulation failed');
    setState('PARAMETER_SELECTION');
  };

  const handleBackToWelcome = () => {
    const hasInput = hasInputChangedFromDefault();
    const hasOutput = hasOutputData();

    // If no data to lose, go directly to WELCOME
    if (!hasInput && !hasOutput) {
      setState('WELCOME');
      return;
    }

    // Determine which warning message to show
    const warningKey = hasOutput ? 'both' : 'inputOnly';

    const instance = showEZModal(modal, {
      title: t('parameterSelection.backToWelcomeWarning.title'),
      content: t(`parameterSelection.backToWelcomeWarning.${warningKey}`),
      actions: [
        { label: t('parameterSelection.cancel'), onClick: () => instance.destroy() },
        {
          label: t('parameterSelection.backToWelcomeWarning.confirm'),
          type: 'primary',
          danger: true,
          onClick: async () => {
            await resetAllEZStores();
            setState('WELCOME');
            instance.destroy();
          },
        },
      ],
    });
  };

  const handleStartSimulation = () => {
    if (isStarting) return;

    const apiRequest = createAPIRequest(apiPayload, scenarioTitle, scenarioDescription);
    const validation = validateAPIRequest(apiRequest);

    if (!validation.isValid) {
      messageApi.error(validation.error);
      return;
    }

    const outputExists = hasOutputData();

    if (outputExists && !hasInputChanged()) {
      // Input identical to snapshot - silently return to results
      setState('RESULT_VIEW');
      return;
    }

    setIsStarting(true);

    if (outputExists) {
      // Input changed - clean slate before new simulation
      const setRequestId = useEZSessionStore.getState().setRequestId;
      setRequestId('');
      useScenarioSnapshotStore.getState().reset();
      resetAllEZOutputStores();
    }

    setIsNewSimulation(true);
    setState('AWAIT_RESULTS');
    startSimulation(setState, handleSimulationError);
  }

  return (
    <>
      {contextHolder}
      {messageContextHolder}
      <div className={styles.backButtonContainer}>
          <Button type="link" onClick={handleBackToWelcome} className={styles.backButton}>
            <ArrowLeftOutlined style={{fontSize: '12px'}} />
            {t('parameterSelection.backToWelcome')}
          </Button>
        </div>
        <div className={styles.scenarioTitleContainer}>
          {isEditingTitle ? (
            <>
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                maxLength={MAX_NAME_LENGTH}
                className={styles.scenarioTitleInput}
                autoFocus
                onPressEnter={() => {
                  setScenarioTitle(editedTitle.slice(0, MAX_NAME_LENGTH));
                  setIsEditingTitle(false);
                }}
              />
              <Button
                type="text"
                size="small"
                icon={<SaveOutlined />}
                aria-label={t('parameterSelection.saveTitle')}
                onClick={() => {
                  setScenarioTitle(editedTitle.slice(0, MAX_NAME_LENGTH));
                  setIsEditingTitle(false);
                }}
              />
            </>
          ) : (
            <>
              <div className={styles.scenarioTitleDisplay}>
                <h4>{scenarioTitle || t('parameterSelection.newScenario')}</h4>
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined className={styles.editIcon} />}
                  aria-label={t('parameterSelection.editTitle')}
                  onClick={() => setIsEditingTitle(true)}
                />
              </div>
            </>
          )}
        </div>
      <InputContainer />
      <div className={styles.buttonContainer}>
        <Button
          type="primary"
          onClick={handleStartSimulation}
          disabled={isStarting}
          loading={isStarting}
          className={styles.simulationButton}
        >
          <div className={styles.buttonText}>
            <SendOutlined />
            <span>{t('parameterSelection.startSimulation')}</span>
          </div>
        </Button>
      </div>
    </>
  )
}
