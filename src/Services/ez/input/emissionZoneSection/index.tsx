import { Button, Divider } from 'antd';
import styles from './EmissionZoneSection.module.less';
import { useAPIPayloadStore } from '~store';
import { useEZSessionStore } from '~stores/session';

const EmissionZoneSection = () => {

  const apiZones = useAPIPayloadStore(state => state.payload.zones);
  const sessionZones = useEZSessionStore(state => state.zones);
  const activeZone = useEZSessionStore(state => state.activeZone);
  const addZone = useAPIPayloadStore(state => state.addZone);
  const nextAvailableColor = useEZSessionStore(state => state.nextAvailableColor);

  const activeZoneSession = activeZone ? sessionZones[activeZone] : null;

  return (
    <>
      <Divider orientationMargin={10} orientation="left" className={`${styles.divider} ${styles.boldText}`}>
        <strong>1. CONFIGURE EMISSION ZONES</strong>
      </Divider>

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
