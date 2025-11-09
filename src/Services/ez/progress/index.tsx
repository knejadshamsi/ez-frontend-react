import { useEffect } from 'react';
import { useProgressStore, getProgressStatus, canViewResultsEarly } from './store';
import { useEZServiceStore } from '../stores';
import { useEZSessionStore } from '../stores/session';
import { SuccessState, ErrorState, RunningState } from './states';
import './Progress.module.less';

export { useProgressStore, showProgress, showProgressError, closeProgress } from './store';
export { decodeProgressAlert } from './decoder';

export const Progress = () => {
  const state = useProgressStore();
  const setState = useEZServiceStore((state) => state.setState);
  const abortSseStream = useEZSessionStore((state) => state.abortSseStream);
  const hideProgress = useProgressStore((state) => state.hide);
  const resetProgress = useProgressStore((state) => state.reset);

  const status = getProgressStatus(state);
  const canViewEarly = canViewResultsEarly(state.completedSteps);

  // Auto-hide success state after 3 seconds
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        hideProgress();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, hideProgress]);

  if (!state.isVisible) return null;

  if (status === 'success') {
    return <SuccessState />;
  }

  if (status === 'error') {
    return <ErrorState errorMessage={state.errorMessage} onClose={hideProgress} />;
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
