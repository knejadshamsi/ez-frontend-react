import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useEZSessionStore } from '~stores/session'
import { useAPIPayloadStore, useEZServiceStore } from '~store'

import { InputContainer } from './inputContainer'
import { createAPIRequest, validateAPIRequest, startSimulation } from '~ez/api'
import { hasOutputData, resetAllEZOutputStores } from '~stores/output'
import { resetAllEZStores } from '~stores/reset'
import { hasInputChangedFromDefault } from '~ez/exitHandler'
import { useScenarioSnapshotStore, hasInputChanged } from '~stores/scenario'

import { Button, Input, Modal, message, notification } from 'antd'
import { ArrowLeftOutlined, SendOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons'
import type { ValidationError } from '~ez/api/sse'
import { showEZModal } from '~ez/components/EZModal'
import '~ez/locales'

import styles from './ParameterSelectionView.module.less'

const MAX_NAME_LENGTH = 50;
const SIMULATION_START_COOLDOWN_MS = 3000;

export const ParameterSelectionView = () => {
  const { t } = useTranslation('ez-root');
  const [modal, contextHolder] = Modal.useModal();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [notificationApi, notificationContextHolder] = notification.useNotification();

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
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    setEditedTitle(scenarioTitle);
  }, [scenarioTitle]);

  const resetAfterCooldown = (callback: () => void) => {
    const elapsed = Date.now() - startTimeRef.current;
    const remaining = Math.max(0, SIMULATION_START_COOLDOWN_MS - elapsed);
    setTimeout(() => {
      setIsStarting(false);
      callback();
    }, remaining);
  };

  const handleSimulationError = (errorMessage: string) => {
    resetAfterCooldown(() => {
      messageApi.error(errorMessage || t('parameterSelection.simulationFailed'));
    });
  };

  const handleValidationErrors = (errors: ValidationError[]) => {
    resetAfterCooldown(() => {
      notificationApi.error({
        message: t('parameterSelection.validation.backendError'),
        icon: <></>,
        description: (
          <ul className={styles.validationErrorList}>
            {errors.map((e, i) => (
              <li key={i} className={styles.validationErrorItem}>
                <span className={styles.validationErrorMarker}>x</span>
                <span>{e.message}</span>
              </li>
            ))}
          </ul>
        ),
        placement: 'top',
        className: styles.validationNotification,
        style: { width: 520 },
        closable: false,
        duration: 10,
      });
    });
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
      messageApi.error(t(validation.error));
      return;
    }

    const outputExists = hasOutputData();

    if (outputExists && !hasInputChanged()) {
      // Input identical to snapshot - silently return to results
      setState('RESULT_VIEW');
      return;
    }

    setIsStarting(true);
    startTimeRef.current = Date.now();

    if (outputExists) {
      // Input changed - clean slate before new simulation
      const setRequestId = useEZSessionStore.getState().setRequestId;
      setRequestId('');
      useScenarioSnapshotStore.getState().reset();
      resetAllEZOutputStores();
    }

    setIsNewSimulation(true);
    startSimulation(setState, handleSimulationError, handleValidationErrors);
  }

  return (
    <>
      {contextHolder}
      {messageContextHolder}
      {notificationContextHolder}
      <div className={styles.backButtonContainer}>
          <Button type="link" onClick={handleBackToWelcome} className={styles.backButton}>
            <ArrowLeftOutlined />
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
            {!isStarting && <SendOutlined />}
            <span>{t('parameterSelection.startSimulation')}</span>
          </div>
        </Button>
      </div>
    </>
  )
}
