import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAPIPayloadStore } from '~store';
import { useEZSessionStore } from '~stores/session';
import styles from '../simulationOptions.module.less';
import type { CarDistribution } from '~ez/stores/types';
import { VEHICLE_TYPE_COLORS } from '~ez/stores/types';
import '../locales';

const SEGMENT_COLORS = VEHICLE_TYPE_COLORS;

// Calculate mouse position as percentage with 5% snapping
const calculateSnappedPercentage = (mouseX: number, barRect: DOMRect): number => {
  const rawPercentage = (mouseX / barRect.width) * 100;
  const snappedPercentage = Math.round(rawPercentage / 5) * 5;
  return Math.max(5, Math.min(95, snappedPercentage));
};

// Calculate cumulative percentage before a divider
const calculateCumulativeBefore = (
  dividerIndex: number,
  enabledCategories: string[],
  distribution: CarDistribution
): number => {
  let cumulative = 0;
  for (let i = 0; i < dividerIndex; i++) {
    cumulative += distribution[enabledCategories[i]];
  }
  return cumulative;
};

// Calculate cumulative percentage after right category
const calculateCumulativeAfter = (
  dividerIndex: number,
  enabledCategories: string[],
  distribution: CarDistribution
): number => {
  let cumulative = 0;
  for (let i = dividerIndex + 2; i < enabledCategories.length; i++) {
    cumulative += distribution[enabledCategories[i]];
  }
  return cumulative;
};

// Validate divider position is within allowed range
const isValidDividerPosition = (
  newPosition: number,
  cumulativeBefore: number,
  cumulativeAfter: number
): boolean => {
  const minLeftPos = cumulativeBefore + 5;
  const maxRightPos = 100 - cumulativeAfter - 5;
  return newPosition >= minLeftPos && newPosition <= maxRightPos;
};

// Calculate new distribution for adjacent categories
const calculateNewDistribution = (
  currentDistribution: CarDistribution,
  leftCategory: string,
  rightCategory: string,
  newDividerPos: number,
  cumulativeBefore: number,
  cumulativeAfter: number
): CarDistribution => {
  const newDistribution = { ...currentDistribution };
  newDistribution[leftCategory] = newDividerPos - cumulativeBefore;
  newDistribution[rightCategory] = 100 - cumulativeAfter - newDividerPos;
  return newDistribution;
};

const CarDistributionBar = () => {
  const { t } = useTranslation('ez-simulation-options');
  const carDistribution = useAPIPayloadStore((state) => state.payload.carDistribution);
  const setCarDistribution = useAPIPayloadStore((state) => state.setCarDistribution);
  const sessionStore = useEZSessionStore();

  const [messageApi, contextHolder] = message.useMessage();
  const [isDragging, setIsDragging] = useState<number | null>(null);

  // Get list of enabled categories in order
  const enabledCategories = Object.keys(carDistribution).filter(
    key => sessionStore.carDistributionCategories[key]
  );

  // Handle legend item click (toggle category)
  const handleLegendClick = (categoryKey: string) => {
    const isCurrentlyEnabled = sessionStore.carDistributionCategories[categoryKey];
    const enabledCount = Object.values(sessionStore.carDistributionCategories).filter(v => v).length;

    if (isCurrentlyEnabled && enabledCount <= 1) {
      messageApi.warning(t('basicSettings.vehicleDistribution.minCategoryWarning'));
      return;
    }

    sessionStore.toggleCarDistributionCategory(categoryKey);
  };

  // Calculate divider positions based on enabled categories
  const getDividerPositions = () => {
    const positions: number[] = [];
    let cumulative = 0;

    enabledCategories.forEach((key, index) => {
      if (index < enabledCategories.length - 1) {
        cumulative += carDistribution[key];
        positions.push(cumulative);
      }
    });

    return positions;
  };

  const dividerPositions = getDividerPositions();

  const handleMouseDown = useCallback((dividerIndex: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(dividerIndex);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging === null) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    // Calculate snapped percentage from mouse position
    const newDividerPos = calculateSnappedPercentage(mouseX, rect);

    // Get the two categories on either side of this divider
    const leftCategory = enabledCategories[isDragging];
    const rightCategory = enabledCategories[isDragging + 1];
    if (!leftCategory || !rightCategory) return;

    // Calculate cumulative percentages before and after
    const cumulativeBefore = calculateCumulativeBefore(isDragging, enabledCategories, carDistribution);
    const cumulativeAfter = calculateCumulativeAfter(isDragging, enabledCategories, carDistribution);

    // Validate position is within allowed range
    if (!isValidDividerPosition(newDividerPos, cumulativeBefore, cumulativeAfter)) return;

    // Calculate and apply new distribution
    const newDistribution = calculateNewDistribution(
      carDistribution,
      leftCategory,
      rightCategory,
      newDividerPos,
      cumulativeBefore,
      cumulativeAfter
    );

    setCarDistribution(newDistribution);
  }, [isDragging, carDistribution, enabledCategories, setCarDistribution]);

  useEffect(() => {
    if (isDragging === null) return;

    const handleMouseUp = () => setIsDragging(null);
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [isDragging]);

  return (
    <div className={styles.distributionContainer}>
      {contextHolder}

      {/* Legend above bar */}
      <div className={styles.legend}>
        {Object.entries(SEGMENT_COLORS).map(([key, color]) => {
          const isEnabled = sessionStore.carDistributionCategories[key];
          const label = t(`basicSettings.vehicleDistribution.emissionCategories.${key}`);

          return (
            <div
              key={key}
              className={styles.legendItem}
              onClick={() => handleLegendClick(key)}
              style={{
                cursor: 'pointer',
                opacity: isEnabled ? 1 : 0.5,
                textDecoration: isEnabled ? 'none' : 'line-through'
              }}
            >
              <span
                className={styles.legendColor}
                style={{ backgroundColor: color }}
              />
              <span className={styles.legendLabel}>{label}</span>
            </div>
          );
        })}
      </div>

      {/* Distribution bar */}
      <div className={styles.distributionBar} onMouseMove={handleMouseMove}>
        {/* Segments as direct flex children */}
        {enabledCategories.map((key) => (
          <div
            key={key}
            className={styles.distributionSegment}
            style={{
              width: `${carDistribution[key]}%`,
              backgroundColor: SEGMENT_COLORS[key]
            }}
          >
            <span className={styles.segmentValue}>{carDistribution[key]}%</span>
          </div>
        ))}

        {/* Dividers as separate absolutely positioned children */}
        {dividerPositions.map((pos, index) => (
          <div
            key={`divider-${index}`}
            className={`${styles.dividerBar} ${isDragging === index ? styles.dividerActive : ''}`}
            style={{ left: `${pos}%` }}
            onMouseDown={handleMouseDown(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default CarDistributionBar;
