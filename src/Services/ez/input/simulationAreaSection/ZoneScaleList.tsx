import { type ReactElement, useEffect } from 'react'
import { Button, Tooltip } from 'antd'
import {
  AimOutlined,
  RadiusUpleftOutlined,
  RadiusUprightOutlined,
  RadiusBottomleftOutlined,
  RadiusBottomrightOutlined
} from '@ant-design/icons'
import { useAPIPayloadStore } from '~store'
import { useEZSessionStore } from '~stores/session'
import { colorShader } from '~ez/utils/colorUtils'
import { calculateMaxAllowedScale } from '~ez/utils/scaleUtils'
import selectorStyles from '~ez/styles/simulationAreaSelector.module.less'
import EZSlider from '~ez/components/EZSlider'
import type { OriginType, ScaleUpdate, ValidatedZone } from './types'

const ORIGIN_OPTIONS: OriginType[] = ['center', 'top-left', 'top-right', 'bottom-left', 'bottom-right']
const DEFAULT_SCALE: [number, OriginType] = [100, 'center']

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

const getOriginLabel = (origin: OriginType): string => {
  return origin
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const ZoneScaleList = (): ReactElement => {
  const apiZones = useAPIPayloadStore((state) => state.payload.zones)
  const sessionZones = useEZSessionStore((state) => state.zones)
  const setZoneProperty = useEZSessionStore((state) => state.setZoneProperty)

  const visibleZones = apiZones.filter((zone): zone is ValidatedZone => {
    const sessionData = sessionZones[zone.id]
    return zone.coords !== null && zone.coords !== undefined && sessionData !== undefined && !sessionData.hidden
  })

  const updateZoneSettings = (zoneId: string, updates: ScaleUpdate): void => {
    const sessionData = sessionZones[zoneId]
    if (!sessionData) return

    const [currentPercentage, currentOrigin] = sessionData.scale || DEFAULT_SCALE

    const newScale: [number, OriginType] = [
      updates.percentage ?? currentPercentage,
      (updates.origin ?? currentOrigin) as OriginType
    ]

    setZoneProperty(zoneId, 'scale', newScale)
  }

  // Reset scale to 100% when zone coords change
  useEffect(() => {
    visibleZones.forEach(zone => {
      if (!zone.coords) return

      const sessionData = sessionZones[zone.id]
      if (!sessionData) return

      const [currentScale] = sessionData.scale || DEFAULT_SCALE

      // Reset to 100% if coords have changed
      if (currentScale !== 100) {
        updateZoneSettings(zone.id, { percentage: 100 })
      }
    })
  }, [apiZones.map(z => z.coords).join(',')]) // Watch coords changes

  return (
    <div className={selectorStyles.zoneScaleContainer}>
      {visibleZones.length === 0 ? (
        <div className={selectorStyles.emptyStateMessage}>
          Please select at least one emission zone first
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
