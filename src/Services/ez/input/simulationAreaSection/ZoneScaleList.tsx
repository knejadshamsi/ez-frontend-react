import { type ReactElement, useCallback } from 'react'
import { Button, Tooltip } from 'antd'
import {
  AimOutlined,
  RadiusUpleftOutlined,
  RadiusUprightOutlined,
  RadiusBottomleftOutlined,
  RadiusBottomrightOutlined
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { polygon, area } from '@turf/turf'
import { useAPIPayloadStore } from '~store'
import { useEZSessionStore } from '~stores/session'
import { colorShader } from '~utils/colors'
import { SIMULATION_AREA_CONSTRAINTS } from '~utils/polygonValidation'
import selectorStyles from './simulationAreaSection.module.less'
import EZSlider from '~ez/components/EZSlider'
import type { OriginType, ScaleUpdate, ValidatedZone } from './types'
import type { Coordinate } from '~stores/types'
import './locales'

const ORIGIN_OPTIONS: OriginType[] = ['center', 'top-left', 'top-right', 'bottom-left', 'bottom-right']
const DEFAULT_SCALE: [number, OriginType] = [100, 'center']

const calculateMaxAllowedScale = (coords: Coordinate[][]): number => {
  try {
    const poly = polygon(coords)
    const zoneAreaSqM = area(poly)

    const maxScale = Math.sqrt(
      SIMULATION_AREA_CONSTRAINTS.MAX_AREA_SQ_M / zoneAreaSqM
    ) * 100

    return Math.floor(maxScale)
  } catch (error) {
    console.error('[ZoneScaleList] Error calculating max scale:', error)
    return 100
  }
}

const getOriginIcon = (origin: OriginType): ReactElement => {
  switch (origin) {
    case 'center':
      return <AimOutlined />
    case 'top-left':
      return <RadiusBottomrightOutlined />
    case 'top-right':
      return <RadiusBottomleftOutlined />
    case 'bottom-left':
      return <RadiusUprightOutlined />
    case 'bottom-right':
      return <RadiusUpleftOutlined />
    default:
      return <AimOutlined />
  }
}

const ZoneScaleList = (): ReactElement => {
  const { t } = useTranslation('ez-simulation-area-section')
  const apiZones = useAPIPayloadStore((state) => state.payload.zones)
  const sessionZones = useEZSessionStore((state) => state.zones)
  const setZoneProperty = useEZSessionStore((state) => state.setZoneProperty)

  const getOriginLabel = (origin: OriginType): string => {
    const labelKeys: Record<OriginType, string> = {
      'center': t('zoneScaling.origins.center'),
      'top-left': t('zoneScaling.origins.topLeft'),
      'top-right': t('zoneScaling.origins.topRight'),
      'bottom-left': t('zoneScaling.origins.bottomLeft'),
      'bottom-right': t('zoneScaling.origins.bottomRight'),
    }
    return labelKeys[origin]
  }

  const updateZoneSettings = useCallback((zoneId: string, updates: ScaleUpdate): void => {
    const sessionData = sessionZones[zoneId]
    if (!sessionData) return

    const [currentPercentage, currentOrigin] = sessionData.scale || DEFAULT_SCALE

    const newScale: [number, OriginType] = [
      updates.percentage ?? currentPercentage,
      (updates.origin ?? currentOrigin) as OriginType
    ]

    setZoneProperty(zoneId, 'scale', newScale)
  }, [sessionZones, setZoneProperty])

  const visibleZones = apiZones.filter((zone): zone is ValidatedZone => {
    const sessionData = sessionZones[zone.id]
    return zone.coords !== null && zone.coords !== undefined && sessionData !== undefined && !sessionData.hidden
  })

  return (
    <div className={selectorStyles.zoneScaleContainer}>
      {visibleZones.length === 0 ? (
        <div className={selectorStyles.emptyStateMessage}>
          {t('zoneScaling.emptyState')}
        </div>
      ) : (
        visibleZones.map((zone) => {
            const sessionData = sessionZones[zone.id]
            if (!sessionData) return null

            const [scalePercentage, scaleOrigin] = sessionData.scale || [100, 'center']
            const maxAllowedScale = zone.coords
              ? calculateMaxAllowedScale(zone.coords)
              : 100

            return (
              <div
                key={zone.id}
                className={selectorStyles.zoneScaleCard}
                style={{
                  backgroundColor: colorShader(sessionData.color, 1.9),
                  border: `2px solid ${colorShader(sessionData.color, 1.75)}`,
                }}
              >
                <div className={selectorStyles.zoneScaleNameLabel}>
                  {sessionData.name}
                </div>

                <div className={selectorStyles.originButtonsContainer}>
                  {ORIGIN_OPTIONS.map((origin) => {
                    const isSelected = scaleOrigin === origin
                    return (
                      <Tooltip key={origin} title={getOriginLabel(origin)}>
                        <Button
                          size="small"
                          icon={getOriginIcon(origin)}
                          onClick={() => updateZoneSettings(zone.id, { origin })}
                          className="custom-origin-button"
                          style={{
                            padding: '2px 6px',
                            minWidth: '24px',
                            height: '24px',
                            backgroundColor: isSelected
                              ? `${colorShader(sessionData.color, 1.3)}`
                              : `${colorShader(sessionData.color, 2.0)}`,
                            borderColor: isSelected
                              ? `${sessionData.color}`
                              : `${colorShader(sessionData.color, 1.75)}`,
                            color: isSelected ? '#fff' : '#000',
                            boxShadow: 'none',
                          }}
                          styles={{
                            icon: {
                              color: isSelected ? '#fff' : '#000',
                            }
                          }}
                        />
                      </Tooltip>
                    )
                  })}
                </div>

                <div className={selectorStyles.zoneScaleSliderContainer}>
                  <EZSlider
                    style={{
                      width: '80px',
                      margin: 0,
                    }}
                    min={100}
                    max={maxAllowedScale}
                    value={scalePercentage}
                    onChange={(value: number) => updateZoneSettings(zone.id, { percentage: value })}
                    tooltip={{ formatter: (value: number | undefined) => `${value}%` }}
                    railBg={colorShader(sessionData.color, 2.0)}
                    trackBg={colorShader(sessionData.color, 1.5)}
                    handleColor={sessionData.color}
                  />
                  <span className={selectorStyles.zoneScalePercentage}>
                    {scalePercentage}%
                  </span>
                </div>
              </div>
            )
          })
      )}
    </div>
  )
}

export { ZoneScaleList }
