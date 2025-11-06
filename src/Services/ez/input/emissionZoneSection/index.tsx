import { Button, Divider } from 'antd';
import ZoneSettings from './zoneSettings';
import ZoneCardList from './ZoneCard/ZoneCardList';
import styles from './EmissionZoneSection.module.less';
import { useAPIPayloadStore } from '~store';
import { useEZSessionStore } from '~stores/session';
import { colorShader, HIDDEN_COLOR } from '~ez/utils/colorUtils';

const EmissionZoneSection = () => {

  const apiZones = useAPIPayloadStore(state => state.payload.zones);
  const sessionZones = useEZSessionStore(state => state.zones);
  const activeZone = useEZSessionStore(state => state.activeZone);
  const addZone = useAPIPayloadStore(state => state.addZone);
  const nextAvailableColor = useEZSessionStore(state => state.nextAvailableColor);

  const activeZoneSession = activeZone ? sessionZones[activeZone] : null;

  const containerStyle = activeZoneSession ? {
    border: `2px solid ${activeZoneSession.hidden ? HIDDEN_COLOR : (activeZoneSession.color || '#1890ff')}`,
    backgroundColor: activeZoneSession.hidden
      ? '#f5f5f5'
      : colorShader(activeZoneSession.color || '#1890ff', 1.875)
  } : {};

  return (
    <>
      <Divider orientationMargin={10} orientation="left" className={`${styles.divider} ${styles.boldText}`}>
        <strong>1. CONFIGURE EMISSION ZONES</strong>
      </Divider>

      {apiZones.length > 0 && (
        <ZoneCardList />
      )}

      {activeZone && (
        <div className={styles.mainContainer} style={containerStyle}>
          <ZoneSettings
            zoneId={activeZone}
          />
        </div>
      )}

      {apiZones.length === 1 && (
        <div className={styles.addMoreButtonContainer}>
          <Button
            type="default"
            style={{ width: '100%', backgroundColor: 'white' }}
            onClick={() => {
              const color = nextAvailableColor();
              addZone(`New Zone ${apiZones.length + 1}`, color);
            }}
            id="single-zone-add-button"
          >
            Add More Zones
          </Button>
        </div>
      )}
    </>
  );
};

export { EmissionZoneSection };
