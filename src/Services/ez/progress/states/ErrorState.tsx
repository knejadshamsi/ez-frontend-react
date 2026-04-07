import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import styles from '../Progress.module.less';
import '../locales';

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
        <Button onClick={onClose}>{t('buttons.close')}</Button>
      </div>
    </div>
  );
};
