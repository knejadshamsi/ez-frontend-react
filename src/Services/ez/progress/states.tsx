import { CheckOutlined, LoadingOutlined, WarningOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { StepStatus, StepName, PREPROCESSING_STEPS, SIMULATING_STEPS, POSTPROCESSING_STEPS } from './store';
import { getOutputErrorCount } from '~stores/output';
import { StepItem } from './components';
import styles from './Progress.module.less';
import './locales';

const allCompleted = (steps: StepStatus, stepNames: StepName[]): boolean => {
  return stepNames.every(name => steps[name] === 'completed');
};

export const SuccessState = () => {
  const { t } = useTranslation('ez-progress');
  const errorCount = getOutputErrorCount();

  return (
    <div className={`${styles.simulationNotification} ${styles.successState}`}>
      <div className={styles.notificationContent}>
        {errorCount > 0 ? (
          <WarningOutlined className={styles.warningIcon} />
        ) : (
          <CheckOutlined className={styles.successIcon} />
        )}
        <span className={styles.successMessage}>{t('success.title')}</span>
      </div>
      {errorCount > 0 && (
        <div className={styles.errorCount}>
          {t('success.withErrors', { count: errorCount })}
        </div>
      )}
    </div>
  );
};

interface StatusNotificationProps {
  title: string;
  subtitle?: string | null;
  onCancel?: () => void;
  cancelLabel?: string;
}

const StatusNotification = ({ title, subtitle, onCancel, cancelLabel }: StatusNotificationProps) => (
  <div className={styles.simulationNotification}>
    <div className={styles.queuedContent}>
      <LoadingOutlined className={styles.queuedSpinner} />
      <div className={styles.queuedTextContainer}>
        <span className={styles.queuedTitle}>{title}</span>
        {subtitle && <span className={styles.queuedSubtitle}>{subtitle}</span>}
      </div>
    </div>
    {onCancel && (
      <div className={styles.queuedFooter}>
        <button className={styles.cancelButton} onClick={onCancel}>
          {cancelLabel}
        </button>
      </div>
    )}
  </div>
);

interface QueuedStateProps {
  onCancel: () => void;
}

export const QueuedState = ({ onCancel }: QueuedStateProps) => {
  const { t } = useTranslation('ez-progress');

  return (
    <StatusNotification
      title={t('queued.title')}
      subtitle={t('queued.subtitle')}
      onCancel={onCancel}
      cancelLabel={t('buttons.cancel')}
    />
  );
};

export const CancellingState = () => {
  const { t } = useTranslation('ez-progress');

  return (
    <StatusNotification title={t('cancellation.inProgress')} />
  );
};

interface ErrorStateProps {
  errorMessage: string;
  onClose: () => void;
}

export const ErrorState = ({ errorMessage, onClose }: ErrorStateProps) => {
  const { t } = useTranslation('ez-progress');

  return (
    <div className={`${styles.simulationNotification} ${styles.errorState}`}>
      <div className={styles.notificationHeader}>
        <span className={`${styles.phaseTitle} ${styles.error}`}>{t('error.title')}</span>
      </div>
      <div className={styles.errorMessage}>{errorMessage}</div>
      <div className={styles.notificationFooter}>
        <button className={styles.cancelButton} onClick={onClose}>
          {t('buttons.close')}
        </button>
      </div>
    </div>
  );
};

interface PollingStateProps {
  pollingProgress: string | null;
  onCancel: () => void;
}

export const PollingState = ({ pollingProgress, onCancel }: PollingStateProps) => {
  const { t } = useTranslation('ez-progress');

  return (
    <StatusNotification
      title={t('polling.reconnecting')}
      subtitle={pollingProgress}
      onCancel={onCancel}
      cancelLabel={t('buttons.cancel')}
    />
  );
};

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
  const { t } = useTranslation('ez-progress');
  const showPreprocessing = !allCompleted(completedSteps, PREPROCESSING_STEPS);
  const showSimulating = allCompleted(completedSteps, PREPROCESSING_STEPS) &&
                         !allCompleted(completedSteps, SIMULATING_STEPS);
  const showPostprocessing = allCompleted(completedSteps, SIMULATING_STEPS);

  return (
    <div className={styles.simulationNotification}>
      <div className={styles.notificationHeader}>
        <span className={styles.phaseTitle}>{t('progress.title')}</span>
      </div>

      <div className={styles.phasesContainer}>
        {showPreprocessing ? (
          <div className={`${styles.phaseSection} ${styles.active}`}>
            <div className={styles.phaseLabel}>1. {t('phases.preprocessing')}</div>
            <div className={styles.stepsList}>
              {PREPROCESSING_STEPS.map((stepName) => (
                <StepItem
                  key={stepName}
                  label={t(`steps.${stepName}`)}
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
            <span className={styles.phaseHeaderLabel}>1. {t('phases.preprocessing')}</span>
          </div>
        )}

        {showSimulating ? (
          <div className={`${styles.phaseSection} ${styles.active}`}>
            <div className={styles.phaseLabel}>2. {t('phases.simulating')}</div>
            <div className={styles.stepsList}>
              {SIMULATING_STEPS.map((stepName) => (
                <StepItem
                  key={stepName}
                  label={t(`steps.${stepName}`)}
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
            <span className={styles.phaseHeaderLabel}>2. {t('phases.simulating')}</span>
          </div>
        ) : (
          <div className={`${styles.phaseHeader} ${styles.pending}`}>
            <span className={styles.phaseIcon}>○</span>
            <span className={styles.phaseHeaderLabel}>2. {t('phases.simulating')}</span>
          </div>
        )}

        {showPostprocessing ? (
          <div className={`${styles.phaseSection} ${styles.active}`}>
            <div className={styles.phaseLabel}>3. {t('phases.postProcessing')}</div>
            <div className={styles.stepsList}>
              {POSTPROCESSING_STEPS.map((stepName) => (
                <StepItem
                  key={stepName}
                  label={t(`steps.${stepName}`)}
                  state={completedSteps[stepName]}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className={`${styles.phaseHeader} ${styles.pending}`}>
            <span className={styles.phaseIcon}>○</span>
            <span className={styles.phaseHeaderLabel}>3. {t('phases.postProcessing')}</span>
          </div>
        )}
      </div>

      <div className={styles.notificationFooter}>
        {canViewEarly && (
          <button className={styles.viewResultsButton} onClick={onViewResults}>
            {t('buttons.viewResults')}
          </button>
        )}
        <button className={styles.cancelButton} onClick={onCancel}>
          {t('buttons.cancel')}
        </button>
      </div>
    </div>
  );
};
