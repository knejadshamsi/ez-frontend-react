import { CheckOutlined, LoadingOutlined, CloseOutlined } from '@ant-design/icons';
import { StepState } from './store';
import styles from './Progress.module.less';

interface StepItemProps {
  label: string;
  state: StepState;
}

export const StepItem = ({ label, state }: StepItemProps) => (
  <div className={`${styles.stepItem} ${styles[state]}`}>
    <span className={styles.stepIcon}>
      {state === 'completed' && <CheckOutlined />}
      {state === 'in_progress' && <LoadingOutlined spin />}
      {state === 'failed' && <CloseOutlined />}
      {state === 'pending' && <span className={styles.stepPending} />}
    </span>
    <span className={styles.stepLabel}>{label}</span>
  </div>
);
