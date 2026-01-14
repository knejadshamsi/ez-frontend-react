import { VehicleRowProps, getVehicleTypeLabel } from '../types';
import { RestrictionBlock } from './RestrictionBlock';
import { colorShader } from '~utils/colors';
import { HEADER_HEIGHT, ROW_HEIGHT, VEHICLE_COLUMN_WIDTH } from '../constants';
import { useEZSessionStore } from '~stores/session';
import { useTranslation } from 'react-i18next';
import '../../locales';

export const VehicleRow = ({
  vehicle,
  rowIndex,
  containerWidth,
  timeColumnWidth,
  zoneColor,
  selectedVehicleType,
  selectedBlockId,
  onVehicleClick,
  onGridDoubleClick,
  onBlockMouseDown,
  onBlockDoubleClick
}: VehicleRowProps) => {
  const { t } = useTranslation('ez-emission-zone-section');
  const rowY = HEADER_HEIGHT + rowIndex * ROW_HEIGHT;

  const sessionStore = useEZSessionStore();
  const isEnabled = sessionStore.carDistributionCategories[vehicle.type];

  const handleVehicleNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sessionStore.toggleCarDistributionCategory(vehicle.type);
  };

  return (
    <g key={`vehicle-${vehicle.type}`}>
      <rect
        x="0"
        y={rowY}
        width={VEHICLE_COLUMN_WIDTH}
        height={ROW_HEIGHT}
        fill={isEnabled
          ? (vehicle.type === selectedVehicleType ? colorShader(zoneColor, 1.5) : colorShader(zoneColor, 2.0))
          : '#f3f4f6'
        }
        opacity={isEnabled ? 1 : 0.5}
        onClick={() => isEnabled && onVehicleClick(vehicle.type)}
      />

      <text
        x="10"
        y={rowY + ROW_HEIGHT / 2}
        dominantBaseline="middle"
        textAnchor="start"
        fontWeight="600"
        fontSize="13"
        fill={isEnabled ? "#374151" : "#9ca3af"}
        style={{ cursor: 'pointer', textDecoration: isEnabled ? 'none' : 'line-through' }}
        onClick={handleVehicleNameClick}
      >
        {getVehicleTypeLabel(vehicle.type, t)}
      </text>

      <defs>
        <pattern
          id={`grid-bg-${vehicle.type}`}
          patternUnits="userSpaceOnUse"
          width={timeColumnWidth * 4}
          height={ROW_HEIGHT}
          patternTransform="translate(0,0)"
        >
          <rect x="0" y="0" width={timeColumnWidth * 2} height={ROW_HEIGHT} fill={colorShader(zoneColor, 1.95)} />
          <rect x={timeColumnWidth * 2} y="0" width={timeColumnWidth * 2} height={ROW_HEIGHT} fill={colorShader(zoneColor, 2.1)} />
        </pattern>
      </defs>

      <rect
        x={VEHICLE_COLUMN_WIDTH}
        y={rowY}
        width={containerWidth - VEHICLE_COLUMN_WIDTH}
        height={ROW_HEIGHT}
        fill={`url(#grid-bg-${vehicle.type})`}
        onDoubleClick={(e) => onGridDoubleClick(e, vehicle.type)}
      />

      {/* Grid lines (2-hour divisions only) */}
      {Array.from({ length: 13 }).map((_, i) => (
        <line
          key={`grid-line-${i}`}
          x1={VEHICLE_COLUMN_WIDTH + i * timeColumnWidth * 4}
          y1={rowY}
          x2={VEHICLE_COLUMN_WIDTH + i * timeColumnWidth * 4}
          y2={rowY + ROW_HEIGHT}
          stroke="#e5e7eb"
          strokeWidth="1"
        />
      ))}

      {/* Bottom border of row */}
      <line
        x1="0"
        y1={rowY + ROW_HEIGHT}
        x2={containerWidth}
        y2={rowY + ROW_HEIGHT}
        stroke="#d1d5db"
        strokeWidth="1"
      />

      {/* Restriction Blocks */}
      {vehicle.blocks.map(block => {
        const isSelected = selectedBlockId === block.id && selectedVehicleType === vehicle.type;

        return (
          <RestrictionBlock
            key={`block-${block.id}`}
            block={block}
            vehicleType={vehicle.type}
            rowIndex={rowIndex}
            timeColumnWidth={timeColumnWidth}
            isSelected={isSelected}
            onMouseDown={onBlockMouseDown}
            onClick={onBlockDoubleClick}
          />
        );
      })}
    </g>
  );
};
