import { Button } from 'antd';
import styles from './MapContainer.module.less';

interface MapContainerProps {
  title: string;
  description?: string;
  children?: JSX.Element;
  className?: string;
  isShown: boolean;
  onToggle: () => void;
}

export const MapContainer = ({
  title,
  description,
  children,
  className,
  isShown,
  onToggle
}: MapContainerProps) => {
  return (
    <div className={`${styles.mapContainer} ${className || ''}`}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{title}</h3>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        <Button
          type="default"
          onClick={onToggle}
          className={styles.toggleButton}
        >
          {isShown ? 'Hide Map' : 'View Map'}
        </Button>
      </div>
      {isShown && children && (
        <div className={styles.content}>
          {children}
        </div>
      )}
    </div>
  );
};

export default MapContainer;