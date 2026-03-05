import type { ReactNode } from 'react';
import { Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import type { HookAPI } from 'antd/es/modal/useModal';
import styles from './EZModal.module.less';

export interface EZModalButton {
  label: string;
  onClick: () => void;
  type?: 'default' | 'primary' | 'dashed' | 'link' | 'text';
  danger?: boolean;
  ghost?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
}

interface EZModalOptions {
  title: string;
  content: ReactNode;
  actions: EZModalButton[];
  leading?: ReactNode;
  icon?: ReactNode;
}

export function showEZModal(modal: HookAPI, options: EZModalOptions) {
  const { title, content, actions, leading, icon } = options;

  const instance = modal.confirm({
    title,
    icon: icon ?? <ExclamationCircleOutlined className={styles.icon} />,
    content: <div className={styles.content}>{content}</div>,
    closable: false,
    maskClosable: false,
    keyboard: false,
    className: styles.modal,
    footer: () => (
      <EZModalFooter actions={actions} leading={leading} />
    ),
  });

  return instance;
}

export function EZModalFooter({
  actions,
  leading,
}: {
  actions: EZModalButton[];
  leading?: ReactNode;
}) {
  return (
    <div className={styles.footer}>
      {leading ?? <div />}
      <div className={styles.footerActions}>
        {actions.map((action, i) => (
          <Button
            key={i}
            size="small"
            type={action.type}
            danger={action.danger}
            ghost={action.ghost}
            disabled={action.disabled}
            loading={action.loading}
            icon={action.icon}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
