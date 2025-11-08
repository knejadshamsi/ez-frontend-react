import { useState, useCallback, useEffect } from 'react'
import { useAPIPayloadStore } from '~store'
import styles from '../simulationOptions.module.less'
import type { CarDistribution } from '~ez/stores/types'

const SEGMENT_COLORS = {
  ev: '#86e086',
  car: '#c0c0c0',
  highEmission: '#ff6b6b'
} as const

const DEFAULT_CAR_RATIO = 0.85

const calculateLeftDividerDistribution = (
  constrainedPercentage: number,
  current: CarDistribution
): CarDistribution => {
  const currentRightPos = current.ev + current.car
  const maxLeft = currentRightPos - 1
  const newEv = Math.min(constrainedPercentage, maxLeft)
  const remaining = 100 - newEv

  const totalOther = current.car + current.highEmission
  const carRatio = totalOther > 0 ? current.car / totalOther : DEFAULT_CAR_RATIO

  const newCar = Math.round(remaining * carRatio)
  const newHighEmission = remaining - newCar

  return {
    ev: newEv,
    car: newCar,
    highEmission: newHighEmission
  }
}

const calculateRightDividerDistribution = (
  constrainedPercentage: number,
  current: CarDistribution
): CarDistribution | null => {
  const minRight = current.ev + 1
  const newRightPos = Math.max(constrainedPercentage, minRight)

  const newCar = newRightPos - current.ev
  const newHighEmission = 100 - newRightPos

  if (newHighEmission >= 1) {
    return {
      ev: current.ev,
      car: newCar,
      highEmission: newHighEmission
    }
  }

  return null
}

const CarDistributionBar = () => {
  const carDistribution = useAPIPayloadStore((state) => state.payload.carDistribution)
  const setCarDistribution = useAPIPayloadStore((state) => state.setCarDistribution)

  const [isDragging, setIsDragging] = useState<'left' | 'right' | null>(null)

  const handleMouseDown = useCallback((divider: 'left' | 'right') => (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(divider)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = Math.round((x / rect.width) * 100)
    const constrainedPercentage = Math.max(1, Math.min(99, percentage))

    const current = useAPIPayloadStore.getState().payload.carDistribution

    if (isDragging === 'left') {
      const newDistribution = calculateLeftDividerDistribution(constrainedPercentage, current)
      setCarDistribution(newDistribution)
    } else if (isDragging === 'right') {
      const newDistribution = calculateRightDividerDistribution(constrainedPercentage, current)
      if (newDistribution) {
        setCarDistribution(newDistribution)
      }
    }
  }, [isDragging, setCarDistribution])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseUp = () => setIsDragging(null)
    document.addEventListener('mouseup', handleMouseUp)
    return () => document.removeEventListener('mouseup', handleMouseUp)
  }, [isDragging])

  const leftDividerPos = carDistribution.ev
  const rightDividerPos = carDistribution.ev + carDistribution.car

  return (
    <div className={styles.distributionContainer}>
      <div className={styles.distributionBar} onMouseMove={handleMouseMove}>
        <div
          className={styles.distributionSegment}
          style={{
            width: `${carDistribution.ev}%`,
            backgroundColor: SEGMENT_COLORS.ev
          }}
        >
          <span className={styles.segmentLabel}>EV</span>
          <span className={styles.segmentValue}>{carDistribution.ev}%</span>
        </div>

        <div
          className={`${styles.dividerBar} ${isDragging === 'left' ? styles.dividerActive : ''}`}
          style={{ left: `${leftDividerPos}%` }}
          onMouseDown={handleMouseDown('left')}
        />

        <div
          className={styles.distributionSegment}
          style={{
            width: `${carDistribution.car}%`,
            backgroundColor: SEGMENT_COLORS.car
          }}
        >
          <span className={styles.segmentLabel}>Car</span>
          <span className={styles.segmentValue}>{carDistribution.car}%</span>
        </div>

        <div
          className={`${styles.dividerBar} ${isDragging === 'right' ? styles.dividerActive : ''}`}
          style={{ left: `${rightDividerPos}%` }}
          onMouseDown={handleMouseDown('right')}
        />

        <div
          className={styles.distributionSegment}
          style={{
            width: `${carDistribution.highEmission}%`,
            backgroundColor: SEGMENT_COLORS.highEmission
          }}
        >
          <span className={styles.segmentLabel}>High Emission</span>
          <span className={styles.segmentValue}>{carDistribution.highEmission}%</span>
        </div>
      </div>
    </div>
  )
}

export default CarDistributionBar
