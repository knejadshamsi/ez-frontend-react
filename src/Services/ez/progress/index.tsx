import { useEffect, useState } from 'react';
import { Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useProgressStore, getProgressStatus, canViewResultsEarly } from './store';
import { useEZServiceStore } from '~store';
import { useEZSessionStore } from '~stores/session';
import {
  useEZOutputOverviewStore,
  useEZOutputEmissionsStore,
  useEZOutputPeopleResponseStore,
  useEZOutputTripLegsStore,
} from '~stores/output';
import { SuccessState, ErrorState, RunningState } from './states';
import styles from './Progress.module.less';

export { useProgressStore, showProgress, showProgressError } from './store';
export { decodeProgressAlert } from './decoder';

export const Progress = () => {
  const state = useProgressStore();
  const setState = useEZServiceStore((state) => state.setState);
  const abortSseStream = useEZSessionStore((state) => state.abortSseStream);
  const isNewSimulation = useEZSessionStore((state) => state.isNewSimulation);
  const isEzBackendAlive = useEZServiceStore((state) => state.isEzBackendAlive);
  const hideProgress = useProgressStore((state) => state.hide);
  const resetProgress = useProgressStore((state) => state.reset);

  const [canTransition, setCanTransition] = useState(false);

  const overviewData = useEZOutputOverviewStore((state) => state.overviewData);
  const emissionsPara1 = useEZOutputEmissionsStore((state) => state.emissionsParagraph1Data);
  const emissionsPara2 = useEZOutputEmissionsStore((state) => state.emissionsParagraph2Data);
  const peoplePara1 = useEZOutputPeopleResponseStore((state) => state.peopleResponseParagraph1Data);
  const peoplePara2 = useEZOutputPeopleResponseStore((state) => state.peopleResponseParagraph2Data);
  const tripLegRecords = useEZOutputTripLegsStore((state) => state.tripLegRecords);

  const status = getProgressStatus(state);
  const canViewEarly = canViewResultsEarly(state.completedSteps);

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        hideProgress();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, hideProgress]);

  useEffect(() => {
    if (!isNewSimulation && !isEzBackendAlive) {
      const timer = setTimeout(() => {
        setCanTransition(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (!isNewSimulation) {
      setCanTransition(true);
    }
  }, [isNewSimulation, isEzBackendAlive]);

  useEffect(() => {
    if (!isNewSimulation && canTransition) {
      const hasData = !!(
        overviewData ||
        emissionsPara1 ||
        emissionsPara2 ||
        peoplePara1 ||
        peoplePara2 ||
        (tripLegRecords && tripLegRecords.length > 0)
      );

      if (hasData) {
        hideProgress();
        setState('RESULT_VIEW');
      }
    }
  }, [
    isNewSimulation,
    canTransition,
    overviewData,
    emissionsPara1,
    emissionsPara2,
    peoplePara1,
    peoplePara2,
    tripLegRecords,
    hideProgress,
    setState,
  ]);

  if (!state.isVisible) return null;

  if (status === 'success') {
    return <SuccessState />;
  }

  if (status === 'error') {
    return <ErrorState errorMessage={state.errorMessage} onClose={hideProgress} />;
  }

  if (!isNewSimulation) {
    const handleCancel = () => {
      abortSseStream();
      resetProgress();
      setState('WELCOME');
    };

    return (
      <div className={styles.loadingScenarioContainer}>
        <div className={styles.loadingContent}>
          <LoadingOutlined className={styles.spinner} />
          <span className={styles.loadingText}>Loading scenario, please wait.</span>
        </div>
        <div className={styles.actionButtons}>
          <Button onClick={handleCancel}>Cancel</Button>
        </div>
      </div>
    );
  }

  const handleViewResults = () => {
    hideProgress();
    setState('RESULT_VIEW');
  };

  const handleCancel = () => {
    abortSseStream();
    resetProgress();
    setState('PARAMETER_SELECTION');
  };

  return (
    <RunningState
      completedSteps={state.completedSteps}
      canViewEarly={canViewEarly}
      onViewResults={handleViewResults}
      onCancel={handleCancel}
    />
  );
};
