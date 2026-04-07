// ===== TOAST =====

export interface EZFeedbackToastAction {
  label: string;
  onClick?: () => void;
  dismiss?: boolean;
  danger?: boolean;
  highlight?: boolean;
}

export interface EZFeedbackToastOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  icon?: boolean;
  closable?: boolean;
  autoDismiss?: boolean;
  actions?: [EZFeedbackToastAction] | [EZFeedbackToastAction, EZFeedbackToastAction];
}

// ===== MODAL =====

export interface EZFeedbackModalAction {
  label: string;
  onClick?: () => void | Promise<void>;
  danger?: boolean;
  highlight?: boolean;
  ghost?: boolean;
  disabled?: boolean;
  loading?: boolean;
  autoDestroy?: boolean;
  autoDestroyOnError?: boolean;
}

export interface EZFeedbackModalOptions {
  title: string;
  content: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
  actions: EZFeedbackModalAction[];
}

export interface EZFeedbackModalInstance {
  destroy: () => void;
  updateActions: (actions: EZFeedbackModalAction[]) => void;
  update: (opts: { content?: React.ReactNode; actions?: EZFeedbackModalAction[] }) => void;
}
