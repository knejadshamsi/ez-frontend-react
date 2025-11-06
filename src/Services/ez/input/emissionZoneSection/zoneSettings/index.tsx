import { useState } from 'react';

import { useAPIPayloadStore, useEZServiceStore } from '~store';
import { useEZSessionStore } from '~stores/session';
import type { TripType } from '~stores/types';
import { colorShader, HIDDEN_COLOR } from '~ez/utils/colorUtils';

import { Button, Input, Tag } from 'antd';
import { EditOutlined, SaveOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

import PolicySection from '../VehicleRestrictions';

import styles from './zoneSettings.module.less';

const MAX_NAME_LENGTH = 50;

const ZoneSettings = ({ zoneId }) => {
  const apiZones = useAPIPayloadStore(state => state.payload.zones);
  const sessionZones = useEZSessionStore(state => state.zones);
  const updateZone = useAPIPayloadStore(state => state.updateZone);
  const setZoneProperty = useEZSessionStore(state => state.setZoneProperty);
  const setState = useEZServiceStore(state => state.setState);

  const apiZone = apiZones.find(z => z.id === zoneId);
  const sessionZone = sessionZones[zoneId];

  const zone = {
    name: sessionZone?.name || '',
    coordinates: apiZone?.coords || null,
    hidden: sessionZone?.hidden || false,
    color: sessionZone?.color || '#CCCCCC',
    journey: apiZone?.trip || ['start'] as TripType[]
  };

  const [isEditingName, setIsEditingName] = useState(false);

  return (
    <div className={styles.zoneSettingContainer}>
      {zone.hidden && (
        <Tag
          icon={<EyeInvisibleOutlined style={{ color: '#ff4d4f' }} />}
          color="default"
          style={{ marginBottom: '12px', fontSize: '13px' }}
        >
          This zone is hidden and will be excluded from simulation
        </Tag>
      )}

      <div className={styles.nameRow} style={{ display: 'flex', alignItems: 'center' }}>
        {isEditingName ? (
          <>
            <Input
              value={zone.name}
              onChange={(e) => {
                setZoneProperty(zoneId, 'name', e.target.value.slice(0, MAX_NAME_LENGTH))
              }}
              maxLength={MAX_NAME_LENGTH}
              style={{ margin: 0, flex: 1, fontSize: '14px', fontWeight: '600' }}
              autoFocus
              onPressEnter={() => setIsEditingName(false)}
              disabled={zone.hidden}
            />
            <Button
              type="text"
              size="small"
              icon={<SaveOutlined />}
              onClick={() => setIsEditingName(false)}
              style={{ marginLeft: '8px', padding: '4px' }}
              disabled={zone.hidden}
            />
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <h4 style={{ margin: '10px 0 0 8px', fontSize: '17px', fontWeight: '700' }}>
                {zone?.name || `Zone ${zoneId}`}
              </h4>
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => setIsEditingName(true)}
                style={{ margin: '10px 0 0 5px', padding: '4px' }}
                disabled={zone.hidden}
              />
            </div>
          </>
        )}
      </div>

      <div
        className={styles.sectionContainer}
        style={{
          backgroundColor: zone.hidden
            ? colorShader(HIDDEN_COLOR, 1.85)
            : (zone.color ? colorShader(zone.color, 1.85) : undefined),
          border: `1px solid ${zone.hidden
            ? colorShader(HIDDEN_COLOR, 1.75)
            : (zone.color ? colorShader(zone.color, 1.75) : undefined)}`
        }}
      >
        <div className={styles.zoneBoundariesGrid}>
          <div>
            <span className={styles.sectionHeader}><strong>BOUNDARIES</strong></span>
            <span className={styles.boundariesText}>
              Geographic boundaries for this emission zone
            </span>
          </div>
          <Button
            onClick={() => {
              setState('EMISSION_ZONE_SELECTION');
            }}
            className={styles.btn}
            disabled={zone.hidden}
          >
            {zone.coordinates
              ? 'Edit zone'
              : 'Draw zone'}
          </Button>
        </div>


      </div>

      <div
        className={styles.sectionContainer}
        style={{
          backgroundColor: zone.hidden
            ? colorShader(HIDDEN_COLOR, 1.85)
            : (zone.color ? colorShader(zone.color, 1.85) : undefined),
          border: `1px solid ${zone.hidden
            ? colorShader(HIDDEN_COLOR, 1.75)
            : (zone.color ? colorShader(zone.color, 1.75) : undefined)}`
        }}
      >
        <span className={styles.sectionHeader}><strong>JOURNEYS</strong></span>
        <div className={styles.boundariesText} style={{ marginBottom: '16px' }}>
          Include Agents in the simulation
        </div>
        <div className={styles.journeyButtonGroup}>
          {(['start', 'pass', 'end'] as TripType[]).map(option => (
            <button
              key={option}
              type="button"
              className={`${styles.journeyButton} ${zone.journey.includes(option) ? styles.selected : ''}`}
              style={{
                backgroundColor: zone.journey.includes(option)
                  ? (zone.hidden ? colorShader(HIDDEN_COLOR, 1.3) : colorShader(zone.color, 1.3))
                  : undefined,
                color: zone.journey.includes(option) ? '#fff' : '#333',
                borderColor: zone.journey.includes(option)
                  ? (zone.hidden ? HIDDEN_COLOR : zone.color)
                  : '#d9d9d9',
                borderWidth: zone.journey.includes(option) ? '1.5px' : '1px',
              }}
              disabled={zone.hidden}
              onClick={() => {
                const isSelected = zone.journey.includes(option);
                let newJourneys;
                if (isSelected) {
                  if (zone.journey.length > 1) {
                    newJourneys = zone.journey.filter(j => j !== option);
                  } else {
                    newJourneys = zone.journey;
                  }
                } else {
                  newJourneys = [...zone.journey, option];
                }
                updateZone(zoneId, { trip: newJourneys });
              }}
            >
              {option === 'start' ? 'Starts within' : option === 'pass' ? 'Passes through' : 'Ends within'}
            </button>
          ))}
        </div>
      </div>

      <PolicySection zoneId={zoneId} />

    </div>
  );
};

export default ZoneSettings;
