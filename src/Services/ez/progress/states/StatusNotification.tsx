import { Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import styles from '../Progress.module.less';

interface StatusNotificationProps {
  title: string;
  subtitle?: string | null;
  onCancel?: () => void;
  cancelLabel?: string;
  extraButton?: { label: string; onClick: () => void };
}

export const StatusNotification = ({ title, subtitle, onCancel, cancelLabel, extraButton }: StatusNotificationProps) => (
  <div className={styles.simulationNotification}>
    <div className={styles.queuedContent}>
      <LoadingOutlined className={styles.queuedSpinner} />
      <div className={styles.queuedTextContainer}>
        <span className={styles.queuedTitle}>{title}</span>
        {subtitle && <span className={styles.queuedSubtitle}>{subtitle}</span>}
      </div>
    </div>
    {(extraButton || onCancel) && (
      <div className={styles.queuedFooter}>
        {extraButton && (
          <Button type="primary" onClick={extraButton.onClick}>
            {extraButton.label}
          </Button>
        )}
        {onCancel && (
          <Button onClick={onCancel}>
            {cancelLabel}
          </Button>
        )}
      </div>
    )}
  </div>
);
