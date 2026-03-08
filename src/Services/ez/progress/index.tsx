import { useEffect, useState } from 'react';
import { Button, message } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useProgressStore, canViewResultsEarly } from './store';
import { useEZServiceStore } from '~store';
import { useEZSessionStore } from '~stores/session';
import {
  useEZOutputOverviewStore,
  useEZOutputEmissionsStore,
  useEZOutputPeopleResponseStore,
  useEZOutputTripLegsStore,
} from '~stores/output';
import { resetOutputState } from '~stores/reset';
import { cancelSimulation } from '~ez/api';
import { QueuedState, SuccessState, ErrorState, RunningState, CancellingState, PollingState } from './states';
import styles from './Progress.module.less';
import './locales';

export { useProgressStore } from './store';
export { decodeProgressAlert } from './decoder';

const COMPLETION_TRANSITION_DELAY_MS = 3000;
const SCENARIO_LOAD_TRANSITION_DELAY_MS = 3000;

export const Progress = () => {
  const { t } = useTranslation('ez-progress');
  const [messageApi, contextHolder] = message.useMessage();
  const state = useProgressStore();
  const setState = useEZServiceStore((s) => s.setState);
  const requestId = useEZSessionStore((s) => s.requestId);
  const isEzBackendAlive = useEZServiceStore((s) => s.isEzBackendAlive);

  const [canTransition, setCanTransition] = useState(false);

  const overviewData = useEZOutputOverviewStore((s) => s.overviewData);
  const emissionsPara1 = useEZOutputEmissionsStore((s) => s.emissionsParagraph1Data);
  const emissionsPara2 = useEZOutputEmissionsStore((s) => s.emissionsParagraph2Data);
  const peoplePara1 = useEZOutputPeopleResponseStore((s) => s.peopleResponseParagraph1Data);
  const peoplePara2 = useEZOutputPeopleResponseStore((s) => s.peopleResponseParagraph2Data);
  const tripLegRecords = useEZOutputTripLegsStore((s) => s.tripLegRecords);

  const { status } = state;
  const canViewEarly = canViewResultsEarly(state.completedSteps);

  // Auto-transition to RESULT_VIEW on completion
  useEffect(() => {
    if (status === 'DISPLAY_COMPLETE') {
      const timer = setTimeout(() => {
        setState('RESULT_VIEW');
      }, COMPLETION_TRANSITION_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [status, setState]);

  // Scenario load transition timing
  useEffect(() => {
    if (status === 'DISPLAY_SCENARIO_LOAD' && !isEzBackendAlive) {
      const timer = setTimeout(() => {
        setCanTransition(true);
      }, SCENARIO_LOAD_TRANSITION_DELAY_MS);
      return () => clearTimeout(timer);
    } else if (status === 'DISPLAY_SCENARIO_LOAD') {
      setCanTransition(true);
    }
  }, [status, isEzBackendAlive]);

  // Auto-transition to RESULT_VIEW when scenario data arrives
  useEffect(() => {
    if (status === 'DISPLAY_SCENARIO_LOAD' && canTransition) {
      const hasData = !!(
        overviewData ||
        emissionsPara1 ||
        emissionsPara2 ||
        peoplePara1 ||
        peoplePara2 ||
        (tripLegRecords && tripLegRecords.length > 0)
      );

      if (hasData) {
        setState('RESULT_VIEW');
      }
    }
  }, [
    status,
    canTransition,
    overviewData,
    emissionsPara1,
    emissionsPara2,
    peoplePara1,
    peoplePara2,
    tripLegRecords,
    setState,
  ]);

  if (status === 'DISPLAY_CANCELLATION') {
    return <>{contextHolder}<CancellingState /></>;
  }

  if (status === 'DISPLAY_COMPLETE') {
    return <>{contextHolder}<SuccessState /></>;
  }

  if (status === 'DISPLAY_ERROR') {
    return (
      <>{contextHolder}
      <ErrorState
        errorMessage={state.errorMessage}
        onClose={() => setState('PARAMETER_SELECTION')}
      />
      </>
    );
  }

  const handleCancel = async () => {
    const currentStatus = useProgressStore.getState().status;
    if (currentStatus === 'DISPLAY_CANCELLATION') return;

    useProgressStore.getState().setStatus('DISPLAY_CANCELLATION');
    const result = await cancelSimulation(requestId);

    if (result !== 'conflict') {
      useEZSessionStore.getState().abortSseStream();
    }
    resetOutputState();
    setState('PARAMETER_SELECTION');

    switch (result) {
      case 'success':
        messageApi.success(t('cancellation.success'));
        break;
      case 'timeout':
        messageApi.error(t('cancellation.timeout'));
        break;
      case 'conflict':
        messageApi.warning(t('cancellation.conflict'));
        break;
      case 'not_found':
      case 'error':
        messageApi.error(t('cancellation.failed'));
        break;
    }
  };

  if (status === 'DISPLAY_QUEUED') {
    return <>{contextHolder}<QueuedState onCancel={handleCancel} /></>;
  }

  if (status === 'DISPLAY_POLLING_RECOVERY') {
    return <>{contextHolder}<PollingState pollingProgress={state.pollingProgress} onCancel={handleCancel} /></>;
  }

  if (status === 'DISPLAY_SCENARIO_LOAD') {
    return (
      <>{contextHolder}
      <div className={styles.loadingScenarioContainer}>
        <div className={styles.loadingContent}>
          <LoadingOutlined className={styles.spinner} />
          <span className={styles.loadingText}>{t('loadingScenario')}</span>
        </div>
        <div className={styles.actionButtons}>
          <Button onClick={handleCancel}>{t('buttons.cancel')}</Button>
        </div>
      </div>
      </>
    );
  }

  // DISPLAY_SIMULATION
  const handleViewResults = () => {
    setState('RESULT_VIEW');
  };

  return (
    <>{contextHolder}
    <RunningState
      completedSteps={state.completedSteps}
      canViewEarly={canViewEarly}
      onViewResults={handleViewResults}
      onCancel={handleCancel}
    />
    </>
  );
};
