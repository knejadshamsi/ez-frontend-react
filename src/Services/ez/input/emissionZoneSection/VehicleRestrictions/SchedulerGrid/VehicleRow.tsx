import { VEHICLE_TYPES, VehicleRowProps } from '../types';
import { RestrictionBlock } from './RestrictionBlock';
import { colorShader } from '~ez/utils/colorUtils';
import { HEADER_HEIGHT, ROW_HEIGHT, VEHICLE_COLUMN_WIDTH } from '../constants';

export const VehicleRow = ({
  vehicle,
  rowIndex,
  containerWidth,
  timeColumnWidth,
  zoneColor,
  selectedVehicleId,
  selectedBlockId,
  onVehicleClick,
  onGridDoubleClick,
  onBlockMouseDown,
  onBlockDoubleClick
}: VehicleRowProps) => {
  const rowY = HEADER_HEIGHT + rowIndex * ROW_HEIGHT;

  return (
    <g key={`vehicle-${vehicle.id}`}>
      <rect
        x="0"
        y={rowY}
        width={VEHICLE_COLUMN_WIDTH}
        height={ROW_HEIGHT}
        fill={vehicle.id === selectedVehicleId ? colorShader(zoneColor, 1.5) : colorShader(zoneColor, 2.0)}
        onClick={() => onVehicleClick(vehicle.id)}
      />

      <text
        x="10"
        y={rowY + ROW_HEIGHT / 2}
        dominantBaseline="middle"
        textAnchor="start"
        fontWeight="600"
        fontSize="13"
        fill="#374151"
        onClick={() => onVehicleClick(vehicle.id)}
      >
        {VEHICLE_TYPES[vehicle.type]?.label || vehicle.type}
      </text>

      <defs>
        <pattern
          id={`grid-bg-${vehicle.id}`}
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
        fill={`url(#grid-bg-${vehicle.id})`}
        onDoubleClick={(e) => onGridDoubleClick(e, vehicle.id)}
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
        const isSelected = selectedBlockId === block.id && selectedVehicleId === vehicle.id;

        return (
          <RestrictionBlock
            key={`block-${block.id}`}
            block={block}
            vehicleId={vehicle.id}
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
