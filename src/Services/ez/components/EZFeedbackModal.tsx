import { Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import type { HookAPI } from 'antd/es/modal/useModal';
import type { EZFeedbackModalOptions, EZFeedbackModalAction, EZFeedbackModalInstance } from './types';
import styles from './EZFeedback.module.less';

export function EZFeedbackModal(modal: HookAPI, options: EZFeedbackModalOptions): EZFeedbackModalInstance {
  const { title, content, actions, closable = false, onClose } = options;

  let currentActions = actions;
  let currentContent = content;

  const instance = modal.confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    content: <div className={styles.modalContent}>{content}</div>,
    closable,
    centered: true,
    maskClosable: false,
    keyboard: false,
    className: styles.modal,
    onCancel: onClose,
    footer: () => (
      <ModalFooter actions={currentActions} onAction={handleAction} />
    ),
  });

  function updateFooter(newActions: EZFeedbackModalAction[]) {
    currentActions = newActions;
    instance.update({
      footer: () => <ModalFooter actions={currentActions} onAction={handleAction} />,
    });
  }

  function updateContent(newContent: React.ReactNode) {
    currentContent = newContent;
    instance.update({
      content: <div className={styles.modalContent}>{currentContent}</div>,
    });
  }

  function handleAction(index: number) {
    const action = currentActions[index];
    const shouldDestroy = action.autoDestroy !== false;

    if (!action.onClick) {
      if (shouldDestroy) instance.destroy();
      return;
    }

    const result = action.onClick();

    if (result instanceof Promise) {
      const originalActions = currentActions.map(a => ({ ...a }));

      updateFooter(
        currentActions.map((a, i) =>
          i === index
            ? { ...a, loading: true, disabled: false }
            : { ...a, disabled: true }
        ),
      );

      result
        .then(() => {
          if (shouldDestroy) instance.destroy();
        })
        .catch(() => {
          if (action.autoDestroyOnError === false) {
            updateFooter(originalActions);
          } else if (shouldDestroy) {
            instance.destroy();
          }
        });
    } else {
      if (shouldDestroy) instance.destroy();
    }
  }

  return {
    destroy: () => instance.destroy(),
    updateActions: (newActions: EZFeedbackModalAction[]) => updateFooter(newActions),
    update: (opts) => {
      if (opts.actions) updateFooter(opts.actions);
      if (opts.content !== undefined) updateContent(opts.content);
    },
  };
}

interface ModalFooterProps {
  actions: EZFeedbackModalAction[];
  onAction: (index: number) => void;
}

export function ModalFooter({ actions, onAction }: ModalFooterProps) {
  if (actions.length === 0) return null;

  return (
    <div className={styles.modalFooter}>
      {actions.map((action, i) => (
        <Button
          key={i}
          size="small"
          danger={action.danger}
          color={action.highlight ? 'primary' : undefined}
          variant={action.highlight ? 'outlined' : undefined}
          ghost={action.ghost}
          disabled={action.disabled}
          loading={action.loading}
          onClick={() => onAction(i)}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}
