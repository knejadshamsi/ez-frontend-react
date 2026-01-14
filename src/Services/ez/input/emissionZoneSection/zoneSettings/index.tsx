import { useAPIPayloadStore, useEZServiceStore } from '~store';
import { useEZSessionStore } from '~stores/session';
import type { TripType } from '~stores/types';
import { colorShader, HIDDEN_COLOR } from '~utils/colors';
import { InlineNameEditor } from '~ez/components/InlineNameEditor';

import { Button, Tag, Tooltip } from 'antd';
import { EyeInvisibleOutlined, FormOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import PolicySection from '../VehicleRestrictions';

import styles from './zoneSettings.module.less';
import '../locales';

const ZoneSettings = ({ zoneId }) => {
  const { t } = useTranslation('ez-emission-zone-section');
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

  const getJourneyLabel = (type: TripType): string => {
    const labels = {
      start: t('zoneSettings.journeys.startsWithin'),
      pass: t('zoneSettings.journeys.passesThrough'),
      end: t('zoneSettings.journeys.endsWithin')
    };
    return labels[type];
  };

  return (
    <div className={styles.zoneSettingContainer}>
      {zone.hidden && (
        <Tag
          icon={<EyeInvisibleOutlined style={{ color: '#ff4d4f' }} />}
          color="default"
          style={{ marginBottom: '12px', fontSize: '13px' }}
        >
          {t('zoneSettings.hiddenTag')}
        </Tag>
      )}

      <div className={styles.nameRow}>
        <InlineNameEditor
          value={zone.name || t('zoneSettings.defaultZoneName', { zoneId })}
          onSave={(newName) => setZoneProperty(zoneId, 'name', newName)}
          disabled={zone.hidden}
        />
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
            <span className={styles.sectionHeader}><strong>{t('zoneSettings.boundaries.title')}</strong></span>
            <span className={styles.boundariesText}>
              {t('zoneSettings.boundaries.description')}
            </span>
          </div>
          {!zone.coordinates ? (
            <Button
              onClick={() => {
                setState('DRAW_EM_ZONE');
              }}
              className={styles.btn}
              disabled={zone.hidden}
            >
              {t('zoneSettings.boundaries.draw')}
            </Button>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '8px',
              alignItems: 'center',
              '--zone-color-base': zone.hidden ? HIDDEN_COLOR : (zone.color || '#1890ff'),
              '--zone-color-light': zone.hidden
                ? colorShader(HIDDEN_COLOR, 1.3)
                : (zone.color ? colorShader(zone.color, 1.3) : '#40a9ff'),
              '--zone-color-border': zone.hidden
                ? colorShader(HIDDEN_COLOR, 1.75)
                : (zone.color ? colorShader(zone.color, 1.75) : '#d9d9d9'),
              '--zone-color-hover': zone.hidden
                ? colorShader(HIDDEN_COLOR, 0.9)
                : (zone.color ? colorShader(zone.color, 0.9) : '#096dd9')
            } as React.CSSProperties & {
              '--zone-color-base': string;
              '--zone-color-light': string;
              '--zone-color-border': string;
              '--zone-color-hover': string;
            }}>
              <Button
                onClick={() => {
                  setState('REDRAW_EM_ZONE');
                }}
                className={`${styles.btn} ${styles.redrawZoneButton}`}
                disabled={zone.hidden}
                type="primary"
                style={{ flex: 1 }}
              >
                {t('zoneSettings.boundaries.redraw')}
              </Button>
              <Tooltip title={t('zoneSettings.boundaries.editTooltip')}>
                <Button
                  onClick={() => {
                    setState('EDIT_EM_ZONE');
                  }}
                  disabled={zone.hidden}
                  type="default"
                  icon={<FormOutlined />}
                  className={styles.editZoneButton}
                />
              </Tooltip>
            </div>
          )}
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
        <span className={styles.sectionHeader}><strong>{t('zoneSettings.journeys.title')}</strong></span>
        <div className={styles.boundariesText}>
          {t('zoneSettings.journeys.description')}
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
              {getJourneyLabel(option)}
            </button>
          ))}
        </div>
      </div>

      <PolicySection zoneId={zoneId} />

    </div>
  );
};

export default ZoneSettings;
