import { type ReactElement } from 'react'
import { Button, Tooltip } from 'antd'
import {
  DashOutlined,
  SmallDashOutlined,
  LineOutlined,
  BorderOutlined,
  BgColorsOutlined
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useEZSessionStore } from '~stores/session'
import type { BorderStyle } from '~stores/session'
import styles from './simulationAreaSection.module.less'
import './locales'

interface SimulationAreaDisplayControlsProps {
  compact?: boolean
}

// Opacity values for fill states
const FILL_OPACITY_TRANSPARENT = 0;
const FILL_OPACITY_LIGHT = 51;      // 20% opacity
const FILL_OPACITY_FULL = 128;      // 50.2% opacity

const SimulationAreaDisplayControls = ({ compact = false }: SimulationAreaDisplayControlsProps): ReactElement => {
  const { t } = useTranslation('ez-simulation-area-section')
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

  const getFillIcon = () => {
    if (simulationAreaDisplay.fillOpacity === FILL_OPACITY_TRANSPARENT) {
      return <BorderOutlined />
    } else if (simulationAreaDisplay.fillOpacity === FILL_OPACITY_LIGHT) {
      return <BgColorsOutlined style={{ opacity: 0.5 }} />
    } else {
      return <BgColorsOutlined />
    }
  }
  const getBorderStyleLabel = () => {
    const styleLabels: Record<BorderStyle, string> = {
      'dashed': t('displayControls.borderStyles.dashed'),
      'solid': t('displayControls.borderStyles.solid'),
      'dotted': t('displayControls.borderStyles.dotted')
    }
    return t('displayControls.borderLabel', { style: styleLabels[simulationAreaDisplay.borderStyle] })
  }

  const getFillLabel = () => {
    let fillStyle: string
    switch (simulationAreaDisplay.fillOpacity) {
      case FILL_OPACITY_TRANSPARENT:
        fillStyle = t('displayControls.fillStyles.transparent')
        break
      case FILL_OPACITY_LIGHT:
        fillStyle = t('displayControls.fillStyles.lightlyColored')
        break
      default:
        fillStyle = t('displayControls.fillStyles.colored')
        break
    }
    return t('displayControls.fillLabel', { style: fillStyle })
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
