import { Button, Spin, Alert } from 'antd';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './MapContainer.module.less';
import './locales';

interface MapContainerProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  isShown: boolean;
  onToggle: () => void;
  isLoading?: boolean;
  hasData?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const MapContainer = ({
  title,
  description,
  children,
  className,
  isShown,
  onToggle,
  isLoading = false,
  hasData = true,
  error = null,
  onRetry
}: MapContainerProps) => {
  const { t } = useTranslation('ez-output-utils');

  if (error) {
    return (
      <Alert
        message={t('mapContainer.errorLoading', { title })}
        description={error}
        type="error"
        showIcon
        action={
          onRetry && (
            <Button
              size="small"
              danger
              onClick={onRetry}
              loading={isLoading}
            >
              {t('mapContainer.retry')}
            </Button>
          )
        }
        style={{ marginBottom: '16px' }}
      />
    );
  }

  return (
    <div className={`${styles.mapContainer} ${className || ''}`}>
      <div className={styles.header}>
        {isLoading && (
          <div className={styles.spinnerContainer}>
            <Spin size="small" />
          </div>
        )}
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{title}</h3>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        <Button
          type="default"
          onClick={onToggle}
          className={styles.toggleButton}
          disabled={isLoading}
        >
          {isShown ? t('mapContainer.hideMap') : t('mapContainer.viewMap')}
        </Button>
      </div>
      {isShown && hasData && children && (
        <div className={styles.content}>
          {children}
        </div>
      )}
    </div>
  );
};
