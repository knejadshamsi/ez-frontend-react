import { ColorPicker } from 'antd';
import { EyeInvisibleOutlined, EyeOutlined, CopyOutlined, DeleteOutlined, MinusOutlined } from '@ant-design/icons';
import styles from './ZoneCard.module.less';
import { colorShader, HIDDEN_COLOR } from '~utils/colors';

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
          <div className={styles.toolbarIcon} onClick={handleAction('toggle')}>
            {isHidden ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          </div>
          <div className={styles.toolbarIcon} onClick={handleAction('duplicate')}>
            <CopyOutlined />
          </div>
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
          <div className={styles.toolbarIcon} onClick={handleAction('delete')}>
            <DeleteOutlined style={{ color: 'red' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ZoneCardContent;
