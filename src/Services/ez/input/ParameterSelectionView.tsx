import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useEZSessionStore } from '~stores/session'
import { useAPIPayloadStore, useEZServiceStore } from '~store'

import { InputContainer } from './inputContainer'
import { createAPIRequest, validateAPIRequest, startSimulation } from '~ez/api'
import { hasOutputData, resetAllEZOutputStores } from '~stores/output'
import { resetAllEZStores } from '~stores/reset'
import { hasInputChangedFromDefault } from '~ez/exitHandler'
import { useInputSnapshotStore } from '~stores/scenario'
import { restoreStoresFromInput } from '~ez/api/fetchScenarioInput'

import { Button, Input } from 'antd'
import { ArrowLeftOutlined, SendOutlined, EditOutlined, SaveOutlined, RollbackOutlined } from '@ant-design/icons'
import type { ValidationError } from '~ez/api/sse'
import { useEZFeedback } from '~ez/components/EZFeedback'
import '~ez/locales'

import styles from './ParameterSelectionView.module.less'

const MAX_NAME_LENGTH = 50;
const SIMULATION_START_COOLDOWN_MS = 3000;

export const ParameterSelectionView = () => {
  const { t } = useTranslation('ez-root');
  const { ezFeedback, contextHolder: feedbackContextHolder } = useEZFeedback();

  const setState = useEZServiceStore((state) => state.setState)
  const connectionState = useEZServiceStore((state) => state.connectionState)
  const sessionIntent = useEZServiceStore((state) => state.sessionIntent)
  const ezState = useEZServiceStore((state) => state.state)
  const isInputDirty = useEZServiceStore((state) => state.isInputDirty)
  const scenarioTitle = useEZSessionStore((state) => state.scenarioTitle)
  const scenarioDescription = useEZSessionStore((state) => state.scenarioDescription)
  const setScenarioTitle = useEZSessionStore((state) => state.setScenarioTitle)

  const apiPayload = useAPIPayloadStore(state => state.payload)

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(scenarioTitle);
  const [isStarting, setIsStarting] = useState(false);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    setEditedTitle(scenarioTitle);
  }, [scenarioTitle]);

  // Subscription-based dirty flag: watch input stores for changes during VIEW_PARAMETERS
  useEffect(() => {
    if (ezState !== 'VIEW_PARAMETERS' || sessionIntent === 'VIEW_SCENARIO_OFFLINE') return;

    useEZServiceStore.getState().setIsInputDirty(false);

    const unsubPayload = useAPIPayloadStore.subscribe((state, prev) => {
      if (state.payload !== prev.payload) {
        useEZServiceStore.getState().setIsInputDirty(true);
      }
    });

    const unsubSession = useEZSessionStore.subscribe((state, prev) => {
      if (state.scenarioTitle !== prev.scenarioTitle ||
          state.scenarioDescription !== prev.scenarioDescription) {
        useEZServiceStore.getState().setIsInputDirty(true);
      }
    });

    return () => {
      unsubPayload();
      unsubSession();
    };
  }, [ezState, sessionIntent]);

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
      ezFeedback.toast({ type: 'error', message: errorMessage || t('parameterSelection.simulationFailed') });
    });
  };

  const handleValidationErrors = (errors: ValidationError[]) => {
    resetAfterCooldown(() => {
      ezFeedback.toast({
        type: 'error',
        message: t('parameterSelection.validation.backendError'),
        autoDismiss: false,
        closable: false,
        actions: [
          {
            label: t('parameterSelection.validation.viewDetails'),
            highlight: true,
            dismiss: true,
            onClick: () => {
              ezFeedback.modal({
                title: t('parameterSelection.validation.backendError'),
                content: (
                  <ul className={styles.validationErrorList}>
                    {errors.map((e, i) => (
                      <li key={i} className={styles.validationErrorItem}>
                        <span className={styles.validationErrorMarker}>x</span>
                        <span>{e.message}</span>
                      </li>
                    ))}
                  </ul>
                ),
                closable: true,
                actions: [],
              });
            },
          },
          { label: t('parameterSelection.validation.dismiss'), dismiss: true },
        ],
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

    ezFeedback.modal({
      title: t('parameterSelection.backToWelcomeWarning.title'),
      content: t(`parameterSelection.backToWelcomeWarning.${warningKey}`),
      actions: [
        { label: t('parameterSelection.cancel') },
        {
          label: t('parameterSelection.backToWelcomeWarning.confirm'),
          danger: true,
          onClick: async () => {
            await resetAllEZStores();
            setState('WELCOME');
          },
        },
      ],
    });
  };

  const handleDiscardChanges = () => {
    const snapshot = useInputSnapshotStore.getState();
    if (snapshot.input) {
      restoreStoresFromInput(snapshot.input, snapshot.session);
      useEZServiceStore.getState().setIsInputDirty(false);
      setState('VIEW_RESULTS');
    }
  };

  const handleStartSimulation = () => {
    if (isStarting) return;

    // VIEW_PARAMETERS with existing results: back to results (offline silently discards, non-dirty just navigates)
    if (ezState === 'VIEW_PARAMETERS' && (isOfflineView || !isInputDirty)) {
      if (isOfflineView) {
        const snapshot = useInputSnapshotStore.getState();
        if (snapshot.input) {
          restoreStoresFromInput(snapshot.input, snapshot.session);
        }
      }
      setState('VIEW_RESULTS');
      return;
    }

    const apiRequest = createAPIRequest(apiPayload, scenarioTitle, scenarioDescription);
    const validation = validateAPIRequest(apiRequest);

    if (!validation.isValid) {
      ezFeedback.toast({ type: 'error', message: t(validation.error) });
      return;
    }

    setIsStarting(true);
    startTimeRef.current = Date.now();

    if (hasOutputData()) {
      // Input changed - clean slate before new simulation
      const setRequestId = useEZSessionStore.getState().setRequestId;
      setRequestId('');
      useInputSnapshotStore.getState().reset();
      resetAllEZOutputStores();
    }

    const currentIntent = useEZServiceStore.getState().sessionIntent;
    if (currentIntent !== 'LOAD_DEMO_SCENARIO') {
      useEZServiceStore.getState().setSessionIntent('RUN_NEW_SIMULATION');
    }
    startSimulation(setState, handleSimulationError, handleValidationErrors);
  }

  const isViewParameters = ezState === 'VIEW_PARAMETERS';
  const isOfflineView = sessionIntent === 'VIEW_SCENARIO_OFFLINE';
  const showBackToResults = isViewParameters && (isOfflineView || !isInputDirty);

  return (
    <>
      {feedbackContextHolder}
      <div className={styles.backButtonContainer}>
          <Button type="link" onClick={handleBackToWelcome} className={styles.backButton} disabled={isOfflineView}>
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
        {isViewParameters && isInputDirty && !isOfflineView && (
          <Button
            onClick={handleDiscardChanges}
            className={styles.simulationButton}
          >
            <div className={styles.buttonText}>
              <RollbackOutlined />
              <span>{t('parameterSelection.discardChanges')}</span>
            </div>
          </Button>
        )}
        <Button
          type="primary"
          onClick={handleStartSimulation}
          disabled={isStarting || (sessionIntent === 'RUN_NEW_SIMULATION' && connectionState !== 'FULL_CONNECT')}
          loading={isStarting}
          className={styles.simulationButton}
          aria-label={showBackToResults
            ? t('parameterSelection.backToResults')
            : t('parameterSelection.startSimulation')}
        >
          <div className={styles.buttonText}>
            {!isStarting && <SendOutlined />}
            <span>{showBackToResults
              ? t('parameterSelection.backToResults')
              : t('parameterSelection.startSimulation')}</span>
          </div>
        </Button>
      </div>
    </>
  )
}
