import ModeUtilityCard from './ModeUtilityCard';
import { useAPIPayloadStore } from '~store';
import styles from '../simulationOptions.module.less';

const MODE_CONFIG = [
  { id: 'walk', name: 'Walk' },
  { id: 'bike', name: 'Bike' },
  { id: 'ev', name: 'EV' },
  { id: 'subway', name: 'Subway' },
  { id: 'bus', name: 'Bus' },
  { id: 'car', name: 'Car' }
];

const ModeUtilityAdjustments = () => {
  const modeUtilities = useAPIPayloadStore((state) => state.payload.modeUtilities);
  const setModeUtilities = useAPIPayloadStore((state) => state.setModeUtilities);

  const updateUtilityLevel = (id, newLevel) => {
    if (!Number.isInteger(newLevel) || newLevel < -10 || newLevel > 10) {
      console.error('Invalid utility level:', newLevel);
      return;
    }

    setModeUtilities({
      ...modeUtilities,
      [id]: newLevel
    });
  };

  return (
    <div className={styles.cardsGrid}>
      {MODE_CONFIG.map((mode) => (
        <ModeUtilityCard
          key={mode.id}
          id={mode.id}
          name={mode.name}
          selectedUtilityLevel={modeUtilities[mode.id]}
          onUtilityChange={updateUtilityLevel}
        />
      ))}
    </div>
  );
};

export default ModeUtilityAdjustments;
