import { useState, useCallback, useEffect } from 'react'
import { useAPIPayloadStore } from '~store'
import styles from '../simulationOptions.module.less'
import type { CarDistribution } from '~ez/stores/types'

const SEGMENT_COLORS = {
  zeroEmission: '#86e086',
  lowEmission: '#c0c0c0',
  highEmission: '#ff6b6b'
} as const

const DEFAULT_CAR_RATIO = 0.85

const calculateLeftDividerDistribution = (
  constrainedPercentage: number,
  current: CarDistribution
): CarDistribution => {
  const currentRightPos = current.zeroEmission + current.lowEmission
  const maxLeft = currentRightPos - 1
  const newZeroEmission = Math.min(constrainedPercentage, maxLeft)
  const remaining = 100 - newZeroEmission

  const totalOther = current.lowEmission + current.highEmission
  const lowEmissionRatio = totalOther > 0 ? current.lowEmission / totalOther : DEFAULT_CAR_RATIO

  const newLowEmission = Math.round(remaining * lowEmissionRatio)
  const newHighEmission = remaining - newLowEmission

  return {
    zeroEmission: newZeroEmission,
    lowEmission: newLowEmission,
    highEmission: newHighEmission
  }
}

const calculateRightDividerDistribution = (
  constrainedPercentage: number,
  current: CarDistribution
): CarDistribution | null => {
  const minRight = current.zeroEmission + 1
  const newRightPos = Math.max(constrainedPercentage, minRight)

  const newLowEmission = newRightPos - current.zeroEmission
  const newHighEmission = 100 - newRightPos

  if (newHighEmission >= 1) {
    return {
      zeroEmission: current.zeroEmission,
      lowEmission: newLowEmission,
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

  const leftDividerPos = carDistribution.zeroEmission
  const rightDividerPos = carDistribution.zeroEmission + carDistribution.lowEmission

  return (
    <div className={styles.distributionContainer}>
      <div className={styles.distributionBar} onMouseMove={handleMouseMove}>
        <div
          className={styles.distributionSegment}
          style={{
            width: `${carDistribution.zeroEmission}%`,
            backgroundColor: SEGMENT_COLORS.zeroEmission
          }}
        >
          <span className={styles.segmentLabel}>Zero Emission</span>
          <span className={styles.segmentValue}>{carDistribution.zeroEmission}%</span>
        </div>

        <div
          className={`${styles.dividerBar} ${isDragging === 'left' ? styles.dividerActive : ''}`}
          style={{ left: `${leftDividerPos}%` }}
          onMouseDown={handleMouseDown('left')}
        />

        <div
          className={styles.distributionSegment}
          style={{
            width: `${carDistribution.lowEmission}%`,
            backgroundColor: SEGMENT_COLORS.lowEmission
          }}
        >
          <span className={styles.segmentLabel}>Low Emission</span>
          <span className={styles.segmentValue}>{carDistribution.lowEmission}%</span>
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
