import { useTranslation } from 'react-i18next';
import styles from '../simulationOptions.module.less';
import '../locales';

export const MIN_UTILITY_LEVEL = -10;
export const MAX_UTILITY_LEVEL = 10;

interface ModeUtilityCardProps {
  id: string
  name: string
  selectedUtilityLevel: number
  onUtilityChange: (id: string, newLevel: number) => void
}

const ModeUtilityCard = ({
  id,
  name,
  selectedUtilityLevel,
  onUtilityChange
}: ModeUtilityCardProps) => {
  const { t } = useTranslation('ez-simulation-options');

  const handleClick = (e) => {
    e.preventDefault();

    const isRightClick = e.button === 2;
    const newLevel = selectedUtilityLevel + (isRightClick ? -1 : 1);

    if (newLevel >= MIN_UTILITY_LEVEL && newLevel <= MAX_UTILITY_LEVEL) {
      onUtilityChange(id, newLevel);
    }
  };

  const getGradientStyle = () => {
    const intensity = Math.abs(selectedUtilityLevel) / MAX_UTILITY_LEVEL;
    const alpha = 0.2 + (intensity * 0.4);

    if (selectedUtilityLevel > 0) {
      return {
        background: `radial-gradient(circle at center, rgba(0, 180, 0, ${alpha}) 0%, rgba(255, 255, 255, 0) 140%)`,
        borderColor: `rgba(0, 180, 0, ${alpha})`
      };
    } else if (selectedUtilityLevel < 0) {
      return {
        background: `radial-gradient(circle at center, rgba(180, 0, 0, ${alpha}) 0%, rgba(255, 255, 255, 0) 140%)`,
        borderColor: `rgba(180, 0, 0, ${alpha})`
      };
    } else {
      return {
        background: `none`,
        borderColor: `gray`
      };
    }
  };

  return (
    <div
      className={styles.cardContainer}
      role="button"
      tabIndex={0}
      aria-label={t('attractiveness.ariaLabels.modeCard', { mode: name, level: selectedUtilityLevel })}
      onClick={handleClick}
      onContextMenu={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
          e.preventDefault();
          const newLevel = selectedUtilityLevel + 1;
          if (newLevel <= MAX_UTILITY_LEVEL) onUtilityChange(id, newLevel);
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const newLevel = selectedUtilityLevel - 1;
          if (newLevel >= MIN_UTILITY_LEVEL) onUtilityChange(id, newLevel);
        }
      }}
      style={getGradientStyle()}
    >
      <h3 className={styles.name}>{name}</h3>
      <span className={styles.utilityValue}>
        {selectedUtilityLevel > 0 ? '+' : ''}{selectedUtilityLevel}
      </span>
    </div>
  );
};

export default ModeUtilityCard;
