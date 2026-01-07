import { useAPIPayloadStore } from '~store';
import { useEZSessionStore } from '~stores/session';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ZoneCardContent from './ZoneCardContent';
import styles from './ZoneCard.module.less';

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
    disabled: !isSelected,
  });

  // Apply transform and transition from dnd-kit, hide when dragging
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  const zoneData = sessionZones[zoneId];
  const name = zoneData?.name || '';
  const baseColor = zoneData?.color || '#1890ff';
  const isHidden = zoneData?.hidden || false;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isDragging) setActiveZone(zoneId);
  };

  const handleToggleHidden = () => {
    if (isHidden || Object.values(sessionZones).filter(z => !z.hidden).length > 1) {
      setZoneProperty(zoneId, 'hidden', !isHidden);
    }
  };

  const handleColorChange = (color: string) => {
    setZoneProperty(zoneId, 'color', color);
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.placeholderWrapper}>
      <ZoneCardContent
        zoneId={zoneId}
        name={name}
        baseColor={baseColor}
        isHidden={isHidden}
        isSelected={isSelected}
        isDragging={isDragging}
        onToggleHidden={handleToggleHidden}
        onDuplicate={() => duplicateZone(zoneId)}
        onDelete={() => removeZone(zoneId)}
        onColorChange={handleColorChange}
        onClick={handleClick}
        dragHandleProps={{ attributes, listeners }}
      />
    </div>
  );
};

export default ZoneCard;
