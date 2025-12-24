import { Button, Spin, Alert } from 'antd';
import { ReactNode } from 'react';
import styles from './MapContainer.module.less';

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
  if (error) {
    return (
      <Alert
        message={`Error loading ${title}`}
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
              Retry
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
          {isShown ? 'Hide Map' : 'View Map'}
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

export default MapContainer;
