import { Button, Checkbox, Divider } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useServiceStore } from '~globalStores';
import { useEZServiceStore, useAPIPayloadStore, useDrawToolStore, useDrawingStateStore } from '~store';
import { useEZSessionStore } from '~stores/session';
import styles from './DrawingControls.module.less';

interface LayerItem {
  id: string;
  name: string;
  color: string;
}

interface LayerGroupProps {
  title: string;
  items: LayerItem[];
  type: 'zones' | 'areas';
}

const LayerGroup = ({ title, items, type }: LayerGroupProps) => {
  const visibleIds = useDrawingStateStore(state =>
    type === 'zones' ? state.visibleZoneIds : state.visibleAreaIds
  );
  const toggleVisibility = useDrawingStateStore(state =>
    type === 'zones' ? state.toggleZoneVisibility : state.toggleAreaVisibility
  );
  const showAll = useDrawingStateStore(state =>
    type === 'zones' ? state.showAllZones : state.showAllAreas
  );
  const hideAll = useDrawingStateStore(state =>
    type === 'zones' ? state.hideAllZones : state.hideAllAreas
  );

  const allVisible = items.every(item => visibleIds.has(item.id));

  const handleToggleAll = () => {
    if (allVisible) {
      hideAll();
    } else {
      showAll(items.map(item => item.id));
    }
  };

  return (
    <div className={styles.layerGroup}>
      <div className={styles.groupHeader}>
        <span className={styles.groupTitle}>{title}</span>
        <Checkbox
          checked={allVisible}
          onChange={handleToggleAll}
        >
          Show All
        </Checkbox>
      </div>

      <div className={styles.groupItems}>
        {items.map(item => (
          <div key={item.id} className={styles.layerItem}>
            <Checkbox
              checked={visibleIds.has(item.id)}
              onChange={() => toggleVisibility(item.id)}
            >
              <span style={{ color: item.color }}>{item.name}</span>
            </Checkbox>
          </div>
        ))}
      </div>
    </div>
  );
};

const getOtherZones = (excludeZoneId: string | null, zones: any[], sessionZones: any): LayerItem[] => {
  return zones
    .filter(zone => {
      if (zone.id === excludeZoneId) return false;
      if (!zone.coords) return false;
      const sessionData = sessionZones[zone.id];
      if (!sessionData || sessionData.hidden) return false;
      return true;
    })
    .map(zone => ({
      id: zone.id,
      name: sessionZones[zone.id].name,
      color: sessionZones[zone.id].color,
    }));
};

const getOtherAreas = (
  excludeAreaId: string | null,
  customAreas: any[],
  scaledAreas: any[],
  zones: any[],
  sessionZones: any
): LayerItem[] => {
  const custom = customAreas
    .filter(area => {
      if (area.id === excludeAreaId) return false;
      return area.coords !== null;
    })
    .map(area => ({
      id: area.id,
      name: area.name,
      color: area.color,
    }));

  const scaled = scaledAreas
    .filter(area => {
      const zone = zones.find(z => z.id === area.zoneId);
      if (!zone) return false;
      const sessionData = sessionZones[area.zoneId];
      if (!sessionData || sessionData.hidden) return false;
      return area.coords && area.coords.length > 0;
    })
    .map(area => {
      const zoneName = sessionZones[area.zoneId]?.name || 'Unknown';
      return {
        id: area.id,
        name: `${zoneName} (${area.scale[0]}% scaled)`,
        color: area.color,
      };
    });

  return [...custom, ...scaled];
};

export const DrawingControls = () => {
  const activeService = useServiceStore(state => state.activeService);
  const ezState = useEZServiceStore(state => state.state);
  const setState = useEZServiceStore(state => state.setState);
  const activeZone = useEZSessionStore(state => state.activeZone);
  const activeCustomArea = useEZSessionStore(state => state.activeCustomArea);
  const sessionZones = useEZSessionStore(state => state.zones);
  const zones = useAPIPayloadStore(state => state.payload.zones);
  const customSimulationAreas = useAPIPayloadStore(state => state.payload.customSimulationAreas);
  const scaledSimulationAreas = useAPIPayloadStore(state => state.payload.scaledSimulationAreas);
  const removeZone = useAPIPayloadStore(state => state.removeZone);
  const removeCustomSimulationArea = useAPIPayloadStore(state => state.removeCustomSimulationArea);
  const resetDrawTool = useDrawToolStore(state => state.reset);
  const resetDrawingState = useDrawingStateStore(state => state.reset);

  if (activeService !== 'EZ') return null;
  if (ezState !== 'EMISSION_ZONE_SELECTION' && ezState !== 'SIMULATION_AREA_SELECTION') {
    return null;
  }

  const handleCancel = () => {
    if (ezState === 'EMISSION_ZONE_SELECTION' && activeZone) {
      removeZone(activeZone);
    } else if (ezState === 'SIMULATION_AREA_SELECTION' && activeCustomArea) {
      removeCustomSimulationArea(activeCustomArea);
    }

    resetDrawTool();
    resetDrawingState();
    setState('PARAMETER_SELECTION');
  };

  const otherZones = getOtherZones(
    ezState === 'EMISSION_ZONE_SELECTION' ? activeZone : null,
    zones,
    sessionZones
  );

  const otherAreas = getOtherAreas(
    ezState === 'SIMULATION_AREA_SELECTION' ? activeCustomArea : null,
    customSimulationAreas,
    scaledSimulationAreas,
    zones,
    sessionZones
  );

  return (
    <div className={styles.drawingControlsPanel}>
      <div className={styles.instructionsContainer}>
        <div className={styles.instructions}>
          Click to place points. Complete the polygon or double click to save.
        </div>
        <Button onClick={handleCancel} icon={<CloseOutlined />} size="small" block>
          Cancel
        </Button>
      </div>

      {(otherZones.length > 0 || otherAreas.length > 0) && (
        <>
          <Divider orientation="left">Previous Polygons</Divider>
          <div className={styles.layersContainer}>
            {otherZones.length > 0 && (
              <LayerGroup
                title="EMISSION ZONES"
                items={otherZones}
                type="zones"
              />
            )}

            {otherAreas.length > 0 && (
              <LayerGroup
                title="SIMULATION AREAS"
                items={otherAreas}
                type="areas"
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};
