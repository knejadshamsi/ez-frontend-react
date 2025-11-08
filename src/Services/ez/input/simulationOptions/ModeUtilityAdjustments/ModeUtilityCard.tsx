import styles from '../simulationOptions.module.less';

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
  const handleClick = (e) => {
    e.preventDefault();

    const isRightClick = e.button === 2;
    const newLevel = selectedUtilityLevel + (isRightClick ? -1 : 1);

    if (newLevel >= -10 && newLevel <= 10) {
      onUtilityChange(id, newLevel);
    }
  };

  const getGradientStyle = () => {
    const intensity = Math.abs(selectedUtilityLevel) / 10;
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
    } else if (selectedUtilityLevel === 0) {
      return {
        background: `none`,
        borderColor: `gray`
      };
    }
  };

  return (
    <div
      className={styles.cardContainer}
      onClick={handleClick}
      onContextMenu={handleClick}
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
