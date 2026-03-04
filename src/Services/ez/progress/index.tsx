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
import { resetAllEZOutputStores } from '~stores/output';
import { cancelSimulation } from '~ez/api';
import { SuccessState, ErrorState, RunningState, CancellingState, PollingState } from './states';
import styles from './Progress.module.less';
import './locales';

export { useProgressStore } from './store';
export { decodeProgressAlert } from './decoder';

export const Progress = () => {
  const { t } = useTranslation('ez-progress');
  const [messageApi, contextHolder] = message.useMessage();
  const state = useProgressStore();
  const setState = useEZServiceStore((state) => state.setState);
  const requestId = useEZSessionStore((state) => state.requestId);
  const isEzBackendAlive = useEZServiceStore((state) => state.isEzBackendAlive);

  const [canTransition, setCanTransition] = useState(false);

  const overviewData = useEZOutputOverviewStore((state) => state.overviewData);
  const emissionsPara1 = useEZOutputEmissionsStore((state) => state.emissionsParagraph1Data);
  const emissionsPara2 = useEZOutputEmissionsStore((state) => state.emissionsParagraph2Data);
  const peoplePara1 = useEZOutputPeopleResponseStore((state) => state.peopleResponseParagraph1Data);
  const peoplePara2 = useEZOutputPeopleResponseStore((state) => state.peopleResponseParagraph2Data);
  const tripLegRecords = useEZOutputTripLegsStore((state) => state.tripLegRecords);

  const { status } = state;
  const canViewEarly = canViewResultsEarly(state.completedSteps);

  // Auto-transition to RESULT_VIEW on completion
  useEffect(() => {
    if (status === 'DISPLAY_COMPLETE') {
      const timer = setTimeout(() => {
        setState('RESULT_VIEW');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, setState]);

  // Scenario load transition timing
  useEffect(() => {
    if (status === 'DISPLAY_SCENARIO_LOAD' && !isEzBackendAlive) {
      const timer = setTimeout(() => {
        setCanTransition(true);
      }, 3000);
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

  if (status === 'DISPLAY_POLLING_RECOVERY') {
    return <>{contextHolder}<PollingState pollingProgress={state.pollingProgress} /></>;
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
    useProgressStore.getState().setStatus('DISPLAY_CANCELLATION');
    const result = await cancelSimulation(requestId);

    switch (result) {
      case 'success':
        resetAllEZOutputStores();
        useEZSessionStore.getState().setSseCleanup(null);
        useProgressStore.getState().reset();
        setState('PARAMETER_SELECTION');
        messageApi.success(t('cancellation.success'));
        break;
      case 'timeout':
        useEZSessionStore.getState().abortSseStream();
        useProgressStore.getState().reset();
        setState('PARAMETER_SELECTION');
        messageApi.error(t('cancellation.timeout'));
        break;
      case 'conflict':
        useProgressStore.getState().reset();
        setState('PARAMETER_SELECTION');
        messageApi.warning(t('cancellation.conflict'));
        break;
      case 'not_found':
      case 'error':
        useEZSessionStore.getState().abortSseStream();
        useProgressStore.getState().reset();
        setState('PARAMETER_SELECTION');
        messageApi.error(t('cancellation.failed'));
        break;
    }
  };

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
