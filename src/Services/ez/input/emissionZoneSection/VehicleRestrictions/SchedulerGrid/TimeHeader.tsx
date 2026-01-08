import { generateMergedHeaders } from '../policyConversions';
import { colorShader } from '~utils/colors';
import { HEADER_HEIGHT, VEHICLE_COLUMN_WIDTH, TIME_COLUMNS } from '../constants';
import { TimeHeaderProps } from '../types';

export const TimeHeader = ({ containerWidth, timeColumnWidth, zoneColor }: TimeHeaderProps) => {
  const mergedHeaders = generateMergedHeaders();

  return (
    <g>
      <rect x="0" y="0" width={containerWidth} height={HEADER_HEIGHT} fill={colorShader(zoneColor, 1.95)} />
      <rect x="0" y="0" width={VEHICLE_COLUMN_WIDTH} height={HEADER_HEIGHT} fill={colorShader(zoneColor, 1.8)} />

      {/* Header Vehicle Type Text */}
      <text x="10" y={HEADER_HEIGHT / 2} dominantBaseline="middle" fontSize="12" fontWeight="600" fill="#374151">
        Vehicle Type
      </text>

      {/* Header Labels */}
      {mergedHeaders.map((label, i) => (
        <text
          key={`header-${i}`}
          x={VEHICLE_COLUMN_WIDTH + i * timeColumnWidth * 4 + timeColumnWidth * 4}
          y={HEADER_HEIGHT / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11"
          fill="#6b7280"
        >
          {label}
        </text>
      ))}

      {/* Ruler Section */}
      <g>
        {/* 2-hour marks (major) */}
        {Array.from({ length: 13 }).map((_, i) => (
          <line
            key={`major-${i}`}
            x1={VEHICLE_COLUMN_WIDTH + (i * timeColumnWidth * 4)}
            y1={HEADER_HEIGHT - 8}
            x2={VEHICLE_COLUMN_WIDTH + (i * timeColumnWidth * 4)}
            y2={HEADER_HEIGHT}
            stroke="#9ca3af"
            strokeWidth="1.5"
          />
        ))}

        {/* 1-hour marks (medium) */}
        {Array.from({ length: 24 }).map((_, i) => {
          if (i % 2 !== 0) {
            return (
              <line
                key={`medium-${i}`}
                x1={VEHICLE_COLUMN_WIDTH + (i * timeColumnWidth * 2)}
                y1={HEADER_HEIGHT - 5}
                x2={VEHICLE_COLUMN_WIDTH + (i * timeColumnWidth * 2)}
                y2={HEADER_HEIGHT}
                stroke="#d1d5db"
                strokeWidth="1"
              />
            );
          }
          return null;
        })}

        {/* 30-min marks (minor) */}
        {Array.from({ length: TIME_COLUMNS }).map((_, i) => {
          if (i % 2 !== 0) {
            return (
              <line
                key={`minor-${i}`}
                x1={VEHICLE_COLUMN_WIDTH + (i * timeColumnWidth)}
                y1={HEADER_HEIGHT - 3}
                x2={VEHICLE_COLUMN_WIDTH + (i * timeColumnWidth)}
                y2={HEADER_HEIGHT}
                stroke="#e5e7eb"
                strokeWidth="0.5"
              />
            );
          }
          return null;
        })}
      </g>
    </g>
  );
};
