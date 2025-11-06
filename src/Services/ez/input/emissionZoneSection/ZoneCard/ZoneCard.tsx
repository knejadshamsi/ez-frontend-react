import { ColorPicker } from 'antd';
import { EyeInvisibleOutlined, EyeOutlined, CopyOutlined, DeleteOutlined, MinusOutlined } from '@ant-design/icons';
import { useAPIPayloadStore } from '~store';
import { useEZSessionStore } from '~stores/session';
import styles from './ZoneCard.module.less';
import { colorShader, HIDDEN_COLOR } from '~ez/utils/colorUtils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const ZoneCard = ({ zoneId }) => {
  const sessionZones = useEZSessionStore(state => state.zones);
  const activeZone = useEZSessionStore(state => state.activeZone);
  const setActiveZone = useEZSessionStore(state => state.setActiveZone);
  const setZoneProperty = useEZSessionStore(state => state.setZoneProperty);
  const removeZone = useAPIPayloadStore(state => state.removeZone);
  const duplicateZone = useAPIPayloadStore(state => state.duplicateZone);

  const isSelected = zoneId === activeZone;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: zoneId,
    disabled: !isSelected  // Only selected card is draggable
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
    zIndex: isDragging ? 100 : 'auto',
  };

  const zoneData = sessionZones[zoneId];
  const name = zoneData?.name || '';
  const baseColor = zoneData?.color || '#1890ff';
  const isHidden = zoneData?.hidden || false;

  const baseContainerStyle = {
    border: `2px solid ${isHidden ? HIDDEN_COLOR : baseColor}`,
    backgroundColor: isHidden ? '#f5f5f5' : colorShader(baseColor, 1.875),
  };

  const combinedStyle = { ...baseContainerStyle, ...style };

  const handleAction = (action: string) => (e) => {
    e.stopPropagation();
    switch (action) {
      case 'select':
         e.preventDefault();
        if (!isDragging) setActiveZone(zoneId);
        break;
      case 'toggle':
        if (isHidden || Object.values(sessionZones).filter(z => !z.hidden).length > 1) {
          setZoneProperty(zoneId, 'hidden', !isHidden);
        }
        break;
      case 'duplicate':
        duplicateZone(zoneId);
        break;
      case 'delete':
        removeZone(zoneId);
        break;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={combinedStyle}
      className={`${styles.cardContainer} ${isSelected ? styles.selected : ''} ${isDragging ? styles.dragging : ''}`}
      onClick={handleAction('select')}
    >
      <div className={`${styles.titleRow} ${isSelected ? styles.titleRowSelected : ''}`}>
        {isSelected && (
          <div
            {...attributes}
            {...listeners}
            className={styles.dragHandle}
            style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
            onClick={handleAction('stop')}
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
          <div className={styles.toolbarIcon} onClick={handleAction('stop')}>
            <ColorPicker
              value={baseColor}
              onChange={(color) => setZoneProperty(zoneId, 'color', color.toHexString())}
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

export default ZoneCard;
