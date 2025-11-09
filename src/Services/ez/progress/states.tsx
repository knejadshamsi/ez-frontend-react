import { CheckOutlined } from '@ant-design/icons';
import { StepStatus, StepName, PREPROCESSING_STEPS, SIMULATING_STEPS, POSTPROCESSING_STEPS } from './store';
import { StepItem } from './components';
import styles from './Progress.module.less';

const STEP_CONFIG: Record<StepName, string> = {
  preprocessing_population: 'Population data',
  preprocessing_network: 'Network data',
  preprocessing_transit: 'Transit data',
  preprocessing_config: 'Configuration',
  simulation_base: 'Baseline scenario',
  simulation_policy: 'Policy scenario',
  postprocessing_overview: 'Overview',
  postprocessing_emissions: 'Emissions',
  postprocessing_people_response: 'People Response',
  postprocessing_trip_legs: 'Trip Legs',
};

const allCompleted = (steps: StepStatus, stepNames: StepName[]): boolean => {
  return stepNames.every(name => steps[name] === 'completed');
};

export const SuccessState = () => (
  <div className={`${styles.simulationNotification} ${styles.successState}`}>
    <div className={styles.notificationContent}>
      <CheckOutlined className={styles.successIcon} />
      <span className={styles.successMessage}>Simulation Complete!</span>
    </div>
  </div>
);

interface ErrorStateProps {
  errorMessage: string;
  onClose: () => void;
}

export const ErrorState = ({ errorMessage, onClose }: ErrorStateProps) => (
  <div className={`${styles.simulationNotification} ${styles.errorState}`}>
    <div className={styles.notificationHeader}>
      <span className={`${styles.phaseTitle} ${styles.error}`}>Simulation Error</span>
    </div>
    <div className={styles.errorMessage}>{errorMessage}</div>
    <div className={styles.notificationFooter}>
      <button className={styles.cancelButton} onClick={onClose}>
        Close
      </button>
    </div>
  </div>
);

interface RunningStateProps {
  completedSteps: StepStatus;
  canViewEarly: boolean;
  onViewResults: () => void;
  onCancel: () => void;
}

export const RunningState = ({
  completedSteps,
  canViewEarly,
  onViewResults,
  onCancel
}: RunningStateProps) => {
  const showPreprocessing = !allCompleted(completedSteps, PREPROCESSING_STEPS);
  const showSimulating = allCompleted(completedSteps, PREPROCESSING_STEPS) &&
                         !allCompleted(completedSteps, SIMULATING_STEPS);
  const showPostprocessing = allCompleted(completedSteps, SIMULATING_STEPS);

  return (
    <div className={styles.simulationNotification}>
      <div className={styles.notificationHeader}>
        <span className={styles.phaseTitle}>Simulation Progress</span>
      </div>

      <div className={styles.phasesContainer}>
        {showPreprocessing ? (
          <div className={`${styles.phaseSection} ${styles.active}`}>
            <div className={styles.phaseLabel}>1. Preprocessing</div>
            <div className={styles.stepsList}>
              {PREPROCESSING_STEPS.map((stepName) => (
                <StepItem
                  key={stepName}
                  label={STEP_CONFIG[stepName]}
                  state={completedSteps[stepName]}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className={`${styles.phaseHeader} ${styles.completed}`}>
            <span className={styles.phaseIcon}>
              <CheckOutlined />
            </span>
            <span className={styles.phaseHeaderLabel}>1. Preprocessing</span>
          </div>
        )}

        {showSimulating ? (
          <div className={`${styles.phaseSection} ${styles.active}`}>
            <div className={styles.phaseLabel}>2. Simulating</div>
            <div className={styles.stepsList}>
              {SIMULATING_STEPS.map((stepName) => (
                <StepItem
                  key={stepName}
                  label={STEP_CONFIG[stepName]}
                  state={completedSteps[stepName]}
                />
              ))}
            </div>
          </div>
        ) : allCompleted(completedSteps, PREPROCESSING_STEPS) ? (
          <div className={`${styles.phaseHeader} ${styles.completed}`}>
            <span className={styles.phaseIcon}>
              <CheckOutlined />
            </span>
            <span className={styles.phaseHeaderLabel}>2. Simulating</span>
          </div>
        ) : (
          <div className={`${styles.phaseHeader} ${styles.pending}`}>
            <span className={styles.phaseIcon}>○</span>
            <span className={styles.phaseHeaderLabel}>2. Simulating</span>
          </div>
        )}

        {showPostprocessing ? (
          <div className={`${styles.phaseSection} ${styles.active}`}>
            <div className={styles.phaseLabel}>3. Post Processing</div>
            <div className={styles.stepsList}>
              {POSTPROCESSING_STEPS.map((stepName) => (
                <StepItem
                  key={stepName}
                  label={STEP_CONFIG[stepName]}
                  state={completedSteps[stepName]}
                />
              ))}
            </div>
          </div>
        ) : allCompleted(completedSteps, SIMULATING_STEPS) ? (
          <div className={`${styles.phaseHeader} ${styles.pending}`}>
            <span className={styles.phaseIcon}>○</span>
            <span className={styles.phaseHeaderLabel}>3. Post Processing</span>
          </div>
        ) : (
          <div className={`${styles.phaseHeader} ${styles.pending}`}>
            <span className={styles.phaseIcon}>○</span>
            <span className={styles.phaseHeaderLabel}>3. Post Processing</span>
          </div>
        )}
      </div>

      <div className={styles.notificationFooter}>
        {canViewEarly && (
          <button className={styles.viewResultsButton} onClick={onViewResults}>
            View Results
          </button>
        )}
        <button className={styles.cancelButton} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};
