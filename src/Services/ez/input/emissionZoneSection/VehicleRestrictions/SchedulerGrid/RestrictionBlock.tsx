import { useTranslation } from 'react-i18next';
import { RestrictionBlockProps } from '../types';
import { columnToTime } from '../policyConversions';
import { HEADER_HEIGHT, VEHICLE_COLUMN_WIDTH, ROW_HEIGHT, BLOCK_HEIGHT_RATIO, RESIZE_ZONE_RATIO, DRAG_ZONE_RATIO, ICON_ONLY_THRESHOLD, FULL_LABEL_THRESHOLD } from '../constants';
import styles from '../styles/restrictionBlock.module.less';
import '../../locales';

export const RestrictionBlock = ({
  block,
  vehicleType,
  rowIndex,
  timeColumnWidth,
  isSelected,
  onMouseDown,
  onClick
}: RestrictionBlockProps) => {
  const { t } = useTranslation('ez-emission-zone-section');
  const blockHeight = ROW_HEIGHT * BLOCK_HEIGHT_RATIO;
  const rowY = HEADER_HEIGHT + rowIndex * ROW_HEIGHT;
  const blockY = rowY + (ROW_HEIGHT - blockHeight) / 2;
  const blockX = VEHICLE_COLUMN_WIDTH + block.start * timeColumnWidth;
  const blockWidth = (block.end - block.start) * timeColumnWidth;
  const blockDuration = block.end - block.start;

  // determine block colors
  const blockFill = block.type === 'banned' ? "#fecaca" : "#fde68a";
  const blockStroke = block.type === 'banned' ? "#ef4444" : "#f59e0b";
  const textColor = block.type === 'banned' ? "#b91c1c" : "#92400e";

  // label logic
  const getBlockLabel = () => {
    // icon only (2h blocks or less)
    if (blockDuration <= ICON_ONLY_THRESHOLD) {
      return block.type === 'banned' ? '🛑' : '⚠️';
    }

    // show time range (for larger blocks)
    const startTime = columnToTime(block.start);
    const endTime = columnToTime(block.end);
    const timeText = `${startTime} - ${endTime}`;

    if (block.type === 'banned') {
      return timeText;
    } else {
      // restricted blocks spesifics
      const width = blockDuration * timeColumnWidth;
      if (width > FULL_LABEL_THRESHOLD) {
        return `${timeText} | ${t('vehicleRestrictions.blockEditor.penaltyFormat', { penalty: block.penalty, interval: block.interval })}`;
      } else {
        return timeText;
      }
    }
  };

  return (
    <g className="restriction-block">
      {/* Block background */}
      <rect
        x={blockX}
        y={blockY}
        width={blockWidth}
        height={blockHeight}
        rx="4"
        ry="4"
        fill={blockFill}
        stroke={isSelected ? "#3b82f6" : blockStroke}
        strokeWidth={isSelected ? 2 : 1}
        className={styles.cursorDefault}
      />
      {/* Left 25% - Resize left edge */}
      <rect
        x={blockX}
        y={blockY}
        width={blockWidth * RESIZE_ZONE_RATIO}
        height={blockHeight}
        fill="transparent"
        className={styles.cursorResize}
        onMouseDown={(e) => onMouseDown(e, vehicleType, block.id, 'resize', 'start')}
      />

      {/* Center 50% - Drag to move */}
      <rect
        x={blockX + blockWidth * RESIZE_ZONE_RATIO}
        y={blockY}
        width={blockWidth * DRAG_ZONE_RATIO}
        height={blockHeight}
        fill="transparent"
        className={styles.cursorMove}
        onMouseDown={(e) => onMouseDown(e, vehicleType, block.id, 'move')}
      />

      {/* Right 25% - Resize right edge */}
      <rect
        x={blockX + blockWidth * (RESIZE_ZONE_RATIO + DRAG_ZONE_RATIO)}
        y={blockY}
        width={blockWidth * RESIZE_ZONE_RATIO}
        height={blockHeight}
        fill="transparent"
        className={styles.cursorResize}
        onMouseDown={(e) => onMouseDown(e, vehicleType, block.id, 'resize', 'end')}
      />

      {/* Block label text - clickable to open popover */}
      <text
        x={blockX + blockWidth / 2}
        y={blockY + blockHeight / 2}
        dominantBaseline="middle"
        textAnchor="middle"
        fill={textColor}
        fontSize={blockDuration <= ICON_ONLY_THRESHOLD ? "14" : "11"}
        className={styles.cursorPointer}
        role="button"
        tabIndex={0}
        aria-label={t('vehicleRestrictions.a11y.restrictionBlock', {
          type: block.type,
          start: columnToTime(block.start),
          end: columnToTime(block.end)
        })}
        onClick={(event) => {
          event.stopPropagation();
          onClick(vehicleType, block, rowIndex, event);
        }}
      >
        {getBlockLabel()}
      </text>
    </g>
  );
};
