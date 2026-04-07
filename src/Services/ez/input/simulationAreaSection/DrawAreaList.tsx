import { type ReactElement } from 'react'
import { DeleteOutlined, FormOutlined } from '@ant-design/icons'
import { ColorPicker, Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'
import { useAPIPayloadStore, useEZServiceStore } from '~store'
import { useEZSessionStore } from '~stores/session'
import { colorShader, DEFAULT_CUSTOM_AREA_COLOR } from '~utils/colors'
import { generateDefaultName } from '~utils/zoneNames'
import { InlineNameEditor } from '~ez/components/InlineNameEditor'
import selectorStyles from './simulationAreaSection.module.less'
import type { CustomSimulationArea } from '~ez/stores/types'
import type { AreaColorPreset } from './types'
import './locales'

// Color shader multipliers for draw area cards
const SHADE_GRADIENT = 1.85
const SHADE_CARD_BORDER = 1.75

// Inline style colors
const COLOR_ENABLED = '#1890ff'
const COLOR_DISABLED = '#d9d9d9'
const GRADIENT_ANGLE = 120

const DrawAreaList = (): ReactElement => {
  const { t } = useTranslation('ez-simulation-area-section')

  const COLOR_PRESETS: AreaColorPreset[] = [
    {
      label: t('customAreas.colorPresetLabel'),
      colors: [
        DEFAULT_CUSTOM_AREA_COLOR,
        '#26A69A',
        '#00ACC1',
        '#0097A7',
        '#4DD0E1',
        '#80DEEA',
      ],
    },
  ]

  const customSimulationAreas = useAPIPayloadStore((state) => state.payload.customSimulationAreas)
  const removeCustomSimulationArea = useAPIPayloadStore((state) => state.removeCustomSimulationArea)
  const setState = useEZServiceStore((state) => state.setState)
  const setActiveCustomArea = useEZSessionStore((state) => state.setActiveCustomArea)
  const sessionCustomAreas = useEZSessionStore((state) => state.customAreas)
  const setCustomAreaProperty = useEZSessionStore((state) => state.setCustomAreaProperty)

  return (
    <div className={selectorStyles.drawAreaContainer}>
      {customSimulationAreas.length === 0 ? (
        <div className={selectorStyles.emptyStateMessage}>{t('customAreas.emptyState')}</div>
      ) : (
        customSimulationAreas.map((area: CustomSimulationArea) => {
          const sessionData = sessionCustomAreas[area.id]
          if (!sessionData) return null

          return (
            <div
              key={area.id}
              className={selectorStyles.drawAreaCard}
              style={{
                background: `linear-gradient(${GRADIENT_ANGLE}deg, ${colorShader(DEFAULT_CUSTOM_AREA_COLOR, SHADE_GRADIENT)}, ${colorShader(sessionData.color, SHADE_GRADIENT)})`,
                border: `2px solid ${colorShader(sessionData.color, SHADE_CARD_BORDER)}`,
              }}
            >
              <InlineNameEditor
                value={sessionData.name}
                onSave={(newName) => setCustomAreaProperty(area.id, 'name', newName)}
                autoGenerateName={() => generateDefaultName('customArea')}
                className={selectorStyles.drawAreaNameLabel}
              />
            <div className={selectorStyles.customAreaButtonGroup}>
              <Tooltip title={area.coords ? t('customAreas.editTooltip') : t('customAreas.drawFirstTooltip')}>
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={area.coords ? t('customAreas.editTooltip') : t('customAreas.drawFirstTooltip')}
                  aria-disabled={!area.coords}
                  className={`${selectorStyles.customAreaButton} ${!area.coords ? selectorStyles.disabled : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (area.coords) {
                      setActiveCustomArea(area.id)
                      setState('EDIT_SIMULATION_AREA')
                    }
                  }}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && area.coords) {
                      e.preventDefault()
                      setActiveCustomArea(area.id)
                      setState('EDIT_SIMULATION_AREA')
                    }
                  }}
                  style={{
                    color: area.coords ? COLOR_ENABLED : COLOR_DISABLED,
                    fontSize: '14px',
                  }}
                >
                  <FormOutlined />
                </div>
              </Tooltip>
              <Tooltip title={t('customAreas.changeColorTooltip')}>
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={t('customAreas.changeColorTooltip')}
                  className={selectorStyles.customAreaButton}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      e.stopPropagation()
                    }
                  }}
                >
                  <ColorPicker
                    value={sessionData.color}
                    onChange={(color) => setCustomAreaProperty(area.id, 'color', color.toHexString())}
                    presets={COLOR_PRESETS}
                  >
                    <div className={selectorStyles.colorPickerDot} style={{ backgroundColor: sessionData.color }} />
                  </ColorPicker>
                </div>
              </Tooltip>
              <Tooltip title={t('customAreas.deleteTooltip')}>
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={t('customAreas.deleteTooltip')}
                  className={`${selectorStyles.customAreaButton} ${selectorStyles.deleteButton}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    removeCustomSimulationArea(area.id)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      e.stopPropagation()
                      removeCustomSimulationArea(area.id)
                    }
                  }}
                >
                  <DeleteOutlined />
                </div>
              </Tooltip>
            </div>
          </div>
          )
        })
      )}
    </div>
  )
}

export { DrawAreaList }
