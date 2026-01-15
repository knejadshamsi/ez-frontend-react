import { Button } from 'antd'
import { type ReactElement, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useEZServiceStore, useAPIPayloadStore } from '~store'
import { useEZSessionStore } from '~stores/session'
import { ZoneScaleList } from './ZoneScaleList'
import { DrawAreaList } from './DrawAreaList'
import { SimulationAreaDisplayControls } from './SimulationAreaDisplayControls'
import { polygon, transformScale, bbox, center } from '@turf/turf'
import type { OriginType } from './types'
import type { Zone, Coordinate } from '~ez/stores/types'
import './locales'

import styles from './simulationAreaSection.module.less'

const DEFAULT_CUSTOM_AREA_COLOR = '#00BCD4'
const DEFAULT_SCALE: [number, OriginType] = [100, 'center']

const getBboxPoint = (poly: ReturnType<typeof polygon>, origin: OriginType): [number, number] => {
  const bboxCoords = bbox(poly)
  switch (origin) {
    case 'top-left':
      return [bboxCoords[0], bboxCoords[3]]
    case 'top-right':
      return [bboxCoords[2], bboxCoords[3]]
    case 'bottom-left':
      return [bboxCoords[0], bboxCoords[1]]
    case 'bottom-right':
      return [bboxCoords[2], bboxCoords[1]]
    default:
      return center(poly).geometry.coordinates as [number, number]
  }
}

const calculateScaledCoordinates = (
  zone: Zone,
  percentage: number,
  origin: OriginType
): Coordinate[][] | null => {
  try {
    if (!zone.coords) return null

    const poly = polygon(zone.coords)
    const scaleFactor = percentage / 100

    const scaledPoly = origin === 'center'
      ? transformScale(poly, scaleFactor)
      : transformScale(poly, scaleFactor, { origin: getBboxPoint(poly, origin) })

    return scaledPoly.geometry.coordinates as Coordinate[][]
  } catch (error) {
    console.error(`[SimulationAreaSection] Error scaling zone ${zone.id}:`, error)
    return null
  }
}

const SimulationAreaSection = (): ReactElement => {
  const { t } = useTranslation('ez-simulation-area-section')
  const setState = useEZServiceStore((state) => state.setState)
  const setActiveCustomArea = useEZSessionStore((state) => state.setActiveCustomArea)

  const apiZones = useAPIPayloadStore((state) => state.payload.zones)
  const sessionZones = useEZSessionStore((state) => state.zones)

  const customSimulationAreas = useAPIPayloadStore((state) => state.payload.customSimulationAreas)
  const scaledSimulationAreas = useAPIPayloadStore((state) => state.payload.scaledSimulationAreas)

  const addCustomSimulationArea = useAPIPayloadStore((state) => state.addCustomSimulationArea)
  const upsertScaledSimulationArea = useAPIPayloadStore((state) => state.upsertScaledSimulationArea)
  const removeScaledSimulationArea = useAPIPayloadStore((state) => state.removeScaledSimulationArea)

  const showControls = scaledSimulationAreas.length > 0 || customSimulationAreas.length > 0

  // Calculate simulation areas for visuals based on emission zone + scale
  useEffect(() => {
    const visibleZones = apiZones.filter(zone => {
      const sessionData = sessionZones[zone.id]
      return zone.coords && sessionData && !sessionData.hidden
    })

    const zoneIdsWithScaling = new Set<string>()

    visibleZones.forEach(zone => {
      const sessionData = sessionZones[zone.id]
      if (!sessionData) return

      const [percentage, origin] = sessionData.scale || DEFAULT_SCALE

      // Only create scaled simulation area if scale !== 100%
      if (percentage !== 100) {
        zoneIdsWithScaling.add(zone.id)

        const scaledCoords = calculateScaledCoordinates(zone, percentage, origin as OriginType)
        if (scaledCoords) {
          upsertScaledSimulationArea(
            zone.id,
            scaledCoords,
            [percentage, origin],
            sessionData.color
          )
        }
      }
    })

    // Clean up scaled areas that no longer have scaling
    const currentScaledAreas = useAPIPayloadStore.getState().payload.scaledSimulationAreas
    currentScaledAreas.forEach(scaledArea => {
      if (!zoneIdsWithScaling.has(scaledArea.zoneId)) {
        removeScaledSimulationArea(scaledArea.id)
      }
    })
  }, [apiZones, sessionZones, upsertScaledSimulationArea, removeScaledSimulationArea])

  const handleSelectCustomArea = (): void => {
    const areaColor = DEFAULT_CUSTOM_AREA_COLOR

    const newAreaId = addCustomSimulationArea(areaColor)
    setActiveCustomArea(newAreaId)
    setState('DRAW_SIM_AREA')

    console.log('[SimulationAreaSection] Created custom area:', { id: newAreaId, color: areaColor })
  }

  return (
    <>
      <div className={styles.dividerWithControls}>
        <strong className={styles.dividerTitle}>
          {t('section.title')}
        </strong>
        <hr className={styles.dividerLine} />
        {showControls && (
          <>
            <div className={styles.controlsWrapper}>
              <SimulationAreaDisplayControls compact />
            </div>
            <hr className={styles.dividerLineSpacer} />
          </>
        )}
      </div>

      <div className={`${styles.container} ${styles.simulationAreaContainer}`}>
        <div className={styles.sectionContainer}>
          <div className={styles.subsectionContainer}>
            <span className={styles.sectionHeader}><strong>{t('zoneScaling.title')}</strong></span>
            <div className={styles.descriptionText}>
              {t('zoneScaling.description')}
            </div>
            <ZoneScaleList />
          </div>

          <div className={styles.subsectionContainer}>
            <span className={styles.sectionHeader}><strong>{t('customAreas.title')}</strong></span>
            <div className={styles.descriptionText}>
              {t('customAreas.description')}
            </div>
            <DrawAreaList />
            <div className={styles.customAreaButtonContainer}>
              <Button onClick={handleSelectCustomArea}>
                {customSimulationAreas.length > 0 ? t('customAreas.addAnotherButton') : t('customAreas.addButton')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export { SimulationAreaSection }
