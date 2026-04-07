import { Button, message, Modal } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { MessageInstance } from 'antd/es/message/interface';
import type { HookAPI } from 'antd/es/modal/useModal';
import type { EZFeedbackToastOptions, EZFeedbackModalOptions, EZFeedbackModalInstance } from './types';
import { EZFeedbackModal } from './EZFeedbackModal';
import styles from './EZFeedback.module.less';

interface EZFeedback {
  toast: (options: EZFeedbackToastOptions) => void;
  modal: (options: EZFeedbackModalOptions) => EZFeedbackModalInstance;
}

interface UseEZFeedbackReturn {
  ezFeedback: EZFeedback;
  contextHolder: React.ReactElement;
}

export const useEZFeedback = (): UseEZFeedbackReturn => {
  const [messageApi, messageContextHolder] = message.useMessage();
  const [modalApi, modalContextHolder] = Modal.useModal();

  const ezFeedback: EZFeedback = {
    toast: (options) => showToast(messageApi, options),
    modal: (options) => showModal(modalApi, options),
  };

  const contextHolder = (
    <>
      {messageContextHolder}
      {modalContextHolder}
    </>
  );

  return { ezFeedback, contextHolder };
};

// ===== TOAST =====

const toastIcons: Record<EZFeedbackToastOptions['type'], React.ReactNode> = {
  success: <CheckCircleOutlined />,
  error: <CloseCircleOutlined />,
  warning: <ExclamationCircleOutlined />,
  info: <InfoCircleOutlined />,
};

let toastCounter = 0;

function showToast(messageApi: MessageInstance, options: EZFeedbackToastOptions): void {
  const { type, message: msg, actions, icon = true, closable = true, autoDismiss = true } = options;
  const key = `ez-toast-${++toastCounter}`;

  const content = (
    <>
      {closable && (
        <button
          className={styles.toastClose}
          onClick={() => messageApi.destroy(key)}
        >
          &times;
        </button>
      )}
      <div className={styles.toastContent}>
        <span>{msg}</span>
        {actions && actions.length > 0 && (
          <div className={styles.toastActions}>
            {actions.map((action, i) => (
              <Button
                key={i}
                size="small"
                danger={action.danger}
                color={action.highlight ? 'primary' : undefined}
                variant={action.highlight ? 'outlined' : undefined}
                onClick={() => {
                  action.onClick?.();
                  if (action.dismiss) messageApi.destroy(key);
                }}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </>
  );

  const classNames = [
    closable ? styles.toastClosable : '',
    !icon ? styles.toastNoIcon : '',
  ].filter(Boolean).join(' ') || undefined;

  messageApi.open({
    key,
    type,
    content,
    duration: autoDismiss ? 6 : 0,
    className: classNames,
    icon: icon ? toastIcons[type] : undefined,
  });
}

// ===== MODAL =====

function showModal(modalApi: HookAPI, options: EZFeedbackModalOptions) {
  return EZFeedbackModal(modalApi, options);
}
