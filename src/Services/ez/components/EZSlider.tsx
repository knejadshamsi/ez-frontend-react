import { type ReactElement, useState, useRef, useEffect, useCallback, type CSSProperties } from 'react'
import styles from './EZSlider.module.less'

interface TooltipConfig {
  formatter?: (value: number | undefined) => string | number
}

interface EZSliderProps {
  min?: number
  max?: number
  step?: number
  value?: number
  onChange?: (value: number) => void
  tooltip?: TooltipConfig
  railBg?: string
  trackBg?: string
  handleColor?: string
  style?: CSSProperties
}

const EZSlider = ({
  min = 0,
  max = 100,
  step = 5,
  value = 0,
  onChange,
  tooltip,
  railBg = 'rgba(0,0,0,0.04)',
  trackBg = '#1677ff',
  handleColor = '#1677ff',
  style = {},
}: EZSliderProps): ReactElement => {
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [showTooltip, setShowTooltip] = useState<boolean>(false)
  const sliderRef = useRef<HTMLInputElement>(null)

  const percentage = ((value - min) / (max - min)) * 100
  const tooltipText = tooltip?.formatter ? tooltip.formatter(value) : value

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setShowTooltip(false)
  }, [])

  const handleAction = (action: string) => (e?: any) => {
    switch (action) {
      case 'change':
        const newValue = parseFloat(e.target.value)
        if (onChange) {
          onChange(newValue)
        }
        break
      case 'mousedown':
        setIsDragging(true)
        setShowTooltip(true)
        break
      case 'mouseup':
        handleMouseUp()
        break
      case 'mouseenter':
        setShowTooltip(true)
        break
      case 'mouseleave':
        if (!isDragging) {
          setShowTooltip(false)
        }
        break
    }
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseUp])

  return (
    <div
      className={styles['ez-slider-container']}
      style={style}
      onMouseEnter={handleAction('mouseenter')}
      onMouseLeave={handleAction('mouseleave')}
    >
      {showTooltip && (
        <div
          className={styles['ez-slider-tooltip']}
          style={{
            left: `${percentage}%`,
          }}
        >
          {tooltipText}
        </div>
      )}

      <div className={styles['ez-slider-track-container']}>
        <div
          className={styles['ez-slider-rail']}
          style={{ backgroundColor: railBg }}
        />

        <div
          className={styles['ez-slider-track']}
          style={{
            backgroundColor: trackBg,
            width: `${percentage}%`
          }}
        />

        <div
          className={styles['ez-slider-handle']}
          style={{
            left: `${percentage}%`,
            borderColor: handleColor,
          }}
        />

        <input
          ref={sliderRef}
          type="range"
          className={styles['ez-slider-input']}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleAction('change')}
          onMouseDown={handleAction('mousedown')}
        />
      </div>
    </div>
  )
}

export default EZSlider
