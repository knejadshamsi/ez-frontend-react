import { CheckOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import type { StepStatus, StepName } from '../store';
import { PREPROCESSING_STEPS, SIMULATING_STEPS, POSTPROCESSING_STEPS } from '../store';
import { StepItem } from '../components/StepItem';
import styles from '../Progress.module.less';
import '../locales';

const allCompleted = (steps: StepStatus, stepNames: StepName[]): boolean => {
  return stepNames.every(name => steps[name] === 'completed');
};

interface RunningStateProps {
  completedSteps: StepStatus;
  canViewEarly: boolean;
  onViewResults: () => void;
  onCancel: () => void;
  onStartNew?: () => void;
}

export const RunningState = ({
  completedSteps,
  canViewEarly,
  onViewResults,
  onCancel,
  onStartNew,
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
          <Button size="small" ghost onClick={onViewResults}>
            {t('buttons.viewResults')}
          </Button>
        )}
        {onStartNew && (
          <Button size="small" type="primary" onClick={onStartNew}>
            {t('batch.startNew')}
          </Button>
        )}
        <Button size="small" danger ghost onClick={onCancel}>
          {t('buttons.cancel')}
        </Button>
      </div>
    </div>
  );
};
