import { type ReactElement } from 'react'
import { Button, Tooltip } from 'antd'
import {
  DashOutlined,
  SmallDashOutlined,
  LineOutlined,
  BorderOutlined,
  BgColorsOutlined
} from '@ant-design/icons'
import { useEZSessionStore } from '~stores/session'
import type { BorderStyle } from '~stores/session'
import styles from './simulationAreaDisplayControls.module.less'

interface SimulationAreaDisplayControlsProps {
  compact?: boolean
}

// Opacity values for fill states
const FILL_OPACITY_TRANSPARENT = 0;
const FILL_OPACITY_LIGHT = 51;      // 20% opacity
const FILL_OPACITY_FULL = 128;      // 50.2% opacity

// button cycling design for border style and fill opacity
const SimulationAreaDisplayControls = ({ compact = false }: SimulationAreaDisplayControlsProps): ReactElement => {
  const simulationAreaDisplay = useEZSessionStore((state) => state.simulationAreaDisplay)
  const setSimulationAreaDisplay = useEZSessionStore((state) => state.setSimulationAreaDisplay)

  const containerClassName = compact ? `${styles.controlsContainer} ${styles.compact}` : styles.controlsContainer
  const buttonSize = compact ? 'small' : 'middle'

  // Border style cycling: solid → dashed → dotted → solid
  const handleBorderStyleClick = () => {
    const nextStyle: Record<BorderStyle, BorderStyle> = {
      'solid': 'dashed',
      'dashed': 'dotted',
      'dotted': 'solid'
    }
    setSimulationAreaDisplay({ borderStyle: nextStyle[simulationAreaDisplay.borderStyle] })
  }

  // Fill cycling: transparent (0) → lightly colored (51) → fully colored (128) → transparent
  const handleFillClick = () => {
    let nextOpacity: number

    switch (simulationAreaDisplay.fillOpacity) {
      case FILL_OPACITY_TRANSPARENT:
        nextOpacity = FILL_OPACITY_LIGHT
        break
      case FILL_OPACITY_LIGHT:
        nextOpacity = FILL_OPACITY_FULL
        break
      default:
        nextOpacity = FILL_OPACITY_TRANSPARENT
        break
    }

    setSimulationAreaDisplay({ fillOpacity: nextOpacity })
  }

  // Get icon for border style
  const getBorderStyleIcon = () => {
    switch (simulationAreaDisplay.borderStyle) {
      case 'dashed':
        return <DashOutlined />
      case 'dotted':
        return <SmallDashOutlined />
      case 'solid':
        return <LineOutlined />
    }
  }

  // Get icon for fill with appropriate styling
  const getFillIcon = () => {
    if (simulationAreaDisplay.fillOpacity === FILL_OPACITY_TRANSPARENT) {
      return <BorderOutlined />
    } else if (simulationAreaDisplay.fillOpacity === FILL_OPACITY_LIGHT) {
      return <BgColorsOutlined style={{ opacity: 0.5 }} />
    } else {
      return <BgColorsOutlined />
    }
  }

  // Get tooltip text
  const getBorderStyleLabel = () => {
    const labels: Record<BorderStyle, string> = {
      'dashed': 'Dashed',
      'solid': 'Solid',
      'dotted': 'Dotted'
    }
    return `Border: ${labels[simulationAreaDisplay.borderStyle]}`
  }

  const getFillLabel = () => {
    switch (simulationAreaDisplay.fillOpacity) {
      case FILL_OPACITY_TRANSPARENT:
        return 'Fill: Transparent'
      case FILL_OPACITY_LIGHT:
        return 'Fill: Lightly Colored'
      default:
        return 'Fill: Colored'
    }
  }

  return (
    <div className={containerClassName}>
      <Tooltip title={getBorderStyleLabel()}>
        <Button
          className={styles.iconButton}
          size={buttonSize}
          icon={getBorderStyleIcon()}
          onClick={handleBorderStyleClick}
          style={{
            borderColor: '#80cbc4',
            color: '#00695c'
          }}
        />
      </Tooltip>

      <Tooltip title={getFillLabel()}>
        <Button
          className={styles.iconButton}
          size={buttonSize}
          icon={getFillIcon()}
          onClick={handleFillClick}
          style={{
            borderColor: '#80cbc4',
            color: '#00695c'
          }}
        />
      </Tooltip>
    </div>
  )
}

export { SimulationAreaDisplayControls }
