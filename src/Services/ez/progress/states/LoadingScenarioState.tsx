import { Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import styles from '../Progress.module.less';
import '../locales';

interface LoadingScenarioStateProps {
  onCancel: () => void;
}

export const LoadingScenarioState = ({ onCancel }: LoadingScenarioStateProps) => {
  const { t } = useTranslation('ez-progress');

  return (
    <div className={styles.loadingScenarioContainer}>
      <div className={styles.loadingContent}>
        <LoadingOutlined className={styles.spinner} />
        <span className={styles.loadingText}>{t('loadingScenario')}</span>
      </div>
      <div className={styles.actionButtons}>
        <Button onClick={onCancel}>{t('buttons.cancel')}</Button>
      </div>
    </div>
  );
};
