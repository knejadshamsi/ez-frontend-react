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

  // Fill toggle: transparent (0) ↔ filled (128)
  const handleFillClick = () => {
    const nextOpacity = simulationAreaDisplay.fillOpacity === 0 ? 128 : 0
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

  // Get icon for fill
  const getFillIcon = () => {
    return simulationAreaDisplay.fillOpacity === 0
      ? <BorderOutlined />
      : <BgColorsOutlined />
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
    return `Fill: ${simulationAreaDisplay.fillOpacity === 0 ? 'Transparent' : 'Colored'}`
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
