import { useTranslation } from 'react-i18next';
import ModeUtilityCard from './ModeUtilityCard';
import { useAPIPayloadStore } from '~store';
import styles from '../simulationOptions.module.less';
import '../locales';

const MODE_CONFIG = [
  { id: 'walk' },
  { id: 'bike' },
  { id: 'ev' },
  { id: 'subway' },
  { id: 'bus' },
  { id: 'car' }
];

const ModeUtilityAdjustments = () => {
  const { t } = useTranslation('ez-simulation-options');
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
          name={t(`attractiveness.modes.${mode.id}`)}
          selectedUtilityLevel={modeUtilities[mode.id]}
          onUtilityChange={updateUtilityLevel}
        />
      ))}
    </div>
  );
};

export default ModeUtilityAdjustments;
