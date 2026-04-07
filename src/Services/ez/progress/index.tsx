import { useProgressStore, canViewResultsEarly } from './store';
import { useEZServiceStore } from '~store';
import { useCancelSimulation } from './useCancelSimulation';
import { useStartNewSimulation } from './useStartNewSimulation';
import {
  QueuedState,
  SuccessState,
  ErrorState,
  RunningState,
  CancellingState,
  PollingState,
  LoadingScenarioState,
} from './states';

export { useProgressStore } from './store';
export { decodeProgressAlert } from './decoder';

export const Progress = () => {
  const { handleCancel, contextHolder, cancelDestination } = useCancelSimulation();

  const ezState = useEZServiceStore((s) => s.state);
  const sessionIntent = useEZServiceStore((s) => s.sessionIntent);
  const setState = useEZServiceStore((s) => s.setState);
  const progressState = useProgressStore();
  const canViewEarly = canViewResultsEarly(progressState.completedSteps);

  const showStartNew = sessionIntent === 'RUN_NEW_SIMULATION';
  const { handleStartNew, contextHolder: startNewContextHolder } = useStartNewSimulation();

  if (ezState === 'PROCESS_CANCELLING') {
    return <>{contextHolder}<CancellingState /></>;
  }

  if (ezState === 'PROCESS_COMPLETE') {
    return <>{contextHolder}<SuccessState /></>;
  }

  if (ezState === 'PROCESS_ERROR') {
    return (
      <>{contextHolder}
      <ErrorState
        errorMessage={progressState.errorMessage}
        onClose={() => setState(cancelDestination)}
      />
      </>
    );
  }

  if (ezState === 'PROCESS_QUEUED') {
    return <>{contextHolder}{startNewContextHolder}<QueuedState onCancel={handleCancel} onStartNew={showStartNew ? handleStartNew : undefined} /></>;
  }

  if (ezState === 'PROCESS_POLLING') {
    return <>{contextHolder}<PollingState onCancel={handleCancel} /></>;
  }

  if (ezState === 'PROCESS_CONNECTION_LOST') {
    return <>{contextHolder}<PollingState onCancel={handleCancel} /></>;
  }

  if (ezState === 'PROCESS_RUNNING' && sessionIntent !== 'RUN_NEW_SIMULATION') {
    return <>{contextHolder}<LoadingScenarioState onCancel={handleCancel} /></>;
  }

  // PROCESS_RUNNING (RUN_NEW_SIMULATION)
  return (
    <>{contextHolder}{startNewContextHolder}
    <RunningState
      completedSteps={progressState.completedSteps}
      canViewEarly={canViewEarly}
      onViewResults={() => setState('VIEW_RESULTS')}
      onCancel={handleCancel}
      onStartNew={showStartNew ? handleStartNew : undefined}
    />
    </>
  );
};
