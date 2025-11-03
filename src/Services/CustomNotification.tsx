import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { CheckCircleFilled, CloseCircleFilled, ExclamationCircleFilled, InfoCircleFilled, LoadingOutlined } from '@ant-design/icons';
import styles from './CustomNotification.module.less';

type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface NotificationState {
  message: string;
  type: NotificationType;
  setNotification: (message: string, type: NotificationType) => void;
  clearNotification: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  message: '',
  type: 'info',
  setNotification: (message, type) => set({ message, type }),
  clearNotification: () => set({ message: '' }),
}));

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

export const CustomNotification = () => {
  const message = useNotificationStore((state) => state.message);
  const type = useNotificationStore((state) => state.type);
  const clearNotification = useNotificationStore((state) => state.clearNotification);

  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (message) {
      const id = `notification-${Date.now()}`;
      const newNotification: Notification = { id, message, type };

      setNotifications(prev => [...prev, newNotification]);

      // Auto-dismiss after duration
      const duration = type === 'error' ? 8000 : type === 'warning' ? 6000 : 4000;
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);

      // Clear from store
      clearNotification();
    }
  }, [message, type, clearNotification]);

  const handleClose = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'warning':
        return <ExclamationCircleFilled />;
      case 'error':
        return <CloseCircleFilled />;
      case 'success':
        return <CheckCircleFilled />;
      case 'info':
        return <InfoCircleFilled />;
      case 'loading':
        return <LoadingOutlined spin />;
      default:
        return <InfoCircleFilled />;
    }
  };

  return (
    <div className={styles.container}>
      {notifications.map((notif) => (
        <div key={notif.id} className={`${styles.notification} ${styles[notif.type]}`}>
          <div className={styles.icon}>
            {getIcon(notif.type)}
          </div>
          <div className={styles.message}>
            {notif.message}
          </div>
          <button
            className={styles.close}
            onClick={() => handleClose(notif.id)}
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
};
