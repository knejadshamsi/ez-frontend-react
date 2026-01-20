import { ColorPicker, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import { EyeInvisibleOutlined, EyeOutlined, CopyOutlined, DeleteOutlined, MinusOutlined } from '@ant-design/icons';
import styles from './ZoneCard.module.less';
import { colorShader, HIDDEN_COLOR } from '~utils/colors';
import '../locales';

interface ZoneCardContentProps {
  zoneId: string;
  name: string;
  baseColor: string;
  isHidden: boolean;
  isSelected: boolean;
  isDragging?: boolean;
  onToggleHidden?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onColorChange?: (color: string) => void;
  onClick?: (e: React.MouseEvent) => void;
  dragHandleProps?: {
    attributes: any;
    listeners: any;
  };
}

const ZoneCardContent = ({
  zoneId,
  name,
  baseColor,
  isHidden,
  isSelected,
  isDragging = false,
  onToggleHidden,
  onDuplicate,
  onDelete,
  onColorChange,
  onClick,
  dragHandleProps
}: ZoneCardContentProps) => {
  const { t } = useTranslation('ez-emission-zone-section');
  const baseContainerStyle = {
    border: `2px solid ${isHidden ? HIDDEN_COLOR : baseColor}`,
    backgroundColor: isHidden ? '#f5f5f5' : colorShader(baseColor, 1.875),
  };

  const handleAction = (action: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    switch (action) {
      case 'toggle':
        onToggleHidden?.();
        break;
      case 'duplicate':
        onDuplicate?.();
        break;
      case 'delete':
        onDelete?.();
        break;
    }
  };

  return (
    <div
      style={baseContainerStyle}
      className={`${styles.cardContainer} ${isSelected ? styles.selected : ''} ${isDragging ? styles.dragging : ''}`}
      onClick={onClick}
    >
      <div className={`${styles.titleRow} ${isSelected ? styles.titleRowSelected : ''}`}>
        {isSelected && (
          <div
            {...(dragHandleProps?.attributes || {})}
            {...(dragHandleProps?.listeners || {})}
            className={styles.dragHandle}
            style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
            onClick={(e) => e.stopPropagation()}
          >
            <MinusOutlined />
          </div>
        )}
        {isSelected ? (
          <strong className={`${styles.zoneName} ${styles.zoneNameSelected}`}>{name}</strong>
        ) : (
          <h3 className={styles.zoneName}>{name}</h3>
        )}
      </div>

      {isSelected && (
        <div className={styles.actionToolbar}>
          <Tooltip title={isHidden ? t('zoneSettings.zoneCard.showZone') : t('zoneSettings.zoneCard.hideZone')}>
            <div className={styles.toolbarIcon} onClick={handleAction('toggle')}>
              {isHidden ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            </div>
          </Tooltip>
          <Tooltip title={t('zoneSettings.zoneCard.duplicateZone')}>
            <div className={styles.toolbarIcon} onClick={handleAction('duplicate')}>
              <CopyOutlined />
            </div>
          </Tooltip>
          <Tooltip title={t('zoneSettings.zoneCard.changeColor')}>
            <div className={styles.toolbarIcon} onClick={(e) => e.stopPropagation()}>
              <ColorPicker
                value={baseColor}
                onChange={(color) => onColorChange?.(color.toHexString())}
              >
                <div
                  className={styles.colorTrigger}
                  style={{ backgroundColor: baseColor }}
                />
              </ColorPicker>
            </div>
          </Tooltip>
          <Tooltip title={t('zoneSettings.zoneCard.deleteZone')}>
            <div className={styles.toolbarIcon} onClick={handleAction('delete')}>
              <DeleteOutlined style={{ color: 'red' }} />
            </div>
          </Tooltip>
        </div>
      )}
    </div>
  );
};

export default ZoneCardContent;
