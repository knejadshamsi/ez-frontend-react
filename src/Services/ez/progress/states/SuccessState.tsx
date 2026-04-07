import { CheckOutlined, WarningOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useEZServiceStore } from '~store';
import { getOutputErrorCount } from '~stores/output';
import styles from '../Progress.module.less';
import '../locales';

export const SuccessState = () => {
  const { t } = useTranslation('ez-progress');
  const sessionIntent = useEZServiceStore((s) => s.sessionIntent);
  const errorCount = getOutputErrorCount();

  const title = sessionIntent === 'RUN_NEW_SIMULATION'
    ? t('success.title')
    : t('success.titleScenarioLoaded');

  return (
    <div className={`${styles.simulationNotification} ${styles.successState}`}>
      <div className={styles.notificationContent}>
        {errorCount > 0 ? (
          <WarningOutlined className={styles.warningIcon} />
        ) : (
          <CheckOutlined className={styles.successIcon} />
        )}
        <span className={styles.successMessage}>{title}</span>
      </div>
      {errorCount > 0 && (
        <div className={styles.errorCount}>
          {t('success.withErrors', { count: errorCount })}
        </div>
      )}
    </div>
  );
};
