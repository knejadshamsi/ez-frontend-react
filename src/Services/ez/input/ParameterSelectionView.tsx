import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useEZSessionStore } from '~stores/session'
import { useAPIPayloadStore, useEZServiceStore } from '~store'

import { InputContainer } from './inputContainer'
import { createAPIRequest, validateAPIRequest, startSimulation } from '~ez/api'
import { hasOutputData } from '~stores/output'
import { resetAllEZStores } from '~stores/reset'
import { hasInputChangedFromDefault } from '~ez/exitHandler'

import { Button, Input, Modal, message } from 'antd'
import { ArrowLeftOutlined, SendOutlined, EditOutlined, SaveOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
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

    // Show warning modal
    modal.confirm({
      title: t('parameterSelection.backToWelcomeWarning.title'),
      icon: <ExclamationCircleOutlined />,
      content: t(`parameterSelection.backToWelcomeWarning.${warningKey}`),
      okText: t('parameterSelection.backToWelcomeWarning.confirm'),
      cancelText: t('parameterSelection.cancel'),
      okButtonProps: { danger: true },
      async onOk() {
        await resetAllEZStores();
        setState('WELCOME');
      },
    });
  };

  const handleStartSimulation = () => {
    const apiRequest = createAPIRequest(apiPayload, scenarioTitle, scenarioDescription);
    const validation = validateAPIRequest(apiRequest);

    if (!validation.isValid) {
      messageApi.error(validation.error);
      return;
    }

    const outputExists = hasOutputData();

    if (isEzBackendAlive) {
      if (outputExists) {
        const instance = modal.confirm({
          title: t('parameterSelection.previousResultsFound'),
          icon: <ExclamationCircleOutlined />,
          content: t('parameterSelection.previousResultsMessage'),
          okText: t('parameterSelection.startNewSimulation'),
          cancelText: t('parameterSelection.cancel'),
          onOk() {
            setIsNewSimulation(true);
            setState('AWAIT_RESULTS');
            startSimulation(setState, handleSimulationError);
          },
          footer: (_, { OkBtn, CancelBtn }) => (
            <>
              <CancelBtn />
              <Button
                type="primary"
                onClick={() => {
                  setState('RESULT_VIEW');
                  instance.destroy();
                }}
              >
                {t('parameterSelection.returnToOutput')}
              </Button>
              <OkBtn />
            </>
          ),
        });
      } else {
        setIsNewSimulation(true);
        setState('AWAIT_RESULTS');
        startSimulation(setState, handleSimulationError);
      }
    } else {
      if (outputExists) {
        setState('RESULT_VIEW');
      } else {
        setIsNewSimulation(true);
        setState('AWAIT_RESULTS');
        startSimulation(setState, handleSimulationError);
      }
    }
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
