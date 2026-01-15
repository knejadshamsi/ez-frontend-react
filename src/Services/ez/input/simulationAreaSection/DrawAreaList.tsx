import { type ReactElement } from 'react'
import { DeleteOutlined, FormOutlined } from '@ant-design/icons'
import { ColorPicker, Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'
import { useAPIPayloadStore, useEZServiceStore } from '~store'
import { useEZSessionStore } from '~stores/session'
import { colorShader } from '~utils/colors'
import { generateDefaultName } from '~utils/zoneNames'
import { InlineNameEditor } from '~ez/components/InlineNameEditor'
import selectorStyles from './simulationAreaSection.module.less'
import type { CustomSimulationArea } from '~ez/stores/types'
import type { AreaColorPreset } from './types'
import './locales'

const DEFAULT_CUSTOM_AREA_COLOR = '#00BCD4'

const DrawAreaList = (): ReactElement => {
  const { t } = useTranslation('ez-simulation-area-section')

  const COLOR_PRESETS: AreaColorPreset[] = [
    {
      label: t('customAreas.colorPresetLabel'),
      colors: [
        '#00BCD4',
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
  const updateCustomSimulationArea = useAPIPayloadStore((state) => state.updateCustomSimulationArea)
  const setState = useEZServiceStore((state) => state.setState)
  const setActiveCustomArea = useEZSessionStore((state) => state.setActiveCustomArea)

  return (
    <div className={selectorStyles.drawAreaContainer}>
      {customSimulationAreas.length === 0 ? (
        <div className={selectorStyles.emptyStateMessage}>{t('customAreas.emptyState')}</div>
      ) : (
        customSimulationAreas.map((area: CustomSimulationArea) => (
          <div
            key={area.id}
            className={selectorStyles.drawAreaCard}
            style={{
              background: `linear-gradient(120deg, ${colorShader(DEFAULT_CUSTOM_AREA_COLOR, 1.85)}, ${colorShader(area.color, 1.85)})`,
              border: `2px solid ${colorShader(area.color, 1.75)}`,
            }}
          >
            <InlineNameEditor
              value={area.name}
              onSave={(newName) => updateCustomSimulationArea(area.id, { name: newName })}
              autoGenerateName={() => generateDefaultName('customArea')}
              className={selectorStyles.drawAreaNameLabel}
            />
            <div className={selectorStyles.customAreaButtonGroup}>
              <Tooltip title={area.coords ? t('customAreas.editTooltip') : t('customAreas.drawFirstTooltip')}>
                <div
                  className={`${selectorStyles.customAreaButton} ${!area.coords ? selectorStyles.disabled : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (area.coords) {
                      setActiveCustomArea(area.id)
                      setState('EDIT_SIM_AREA')
                    }
                  }}
                  style={{
                    color: area.coords ? '#1890ff' : '#d9d9d9',
                    fontSize: '14px',
                  }}
                >
                  <FormOutlined />
                </div>
              </Tooltip>
              <Tooltip title={t('customAreas.changeColorTooltip')}>
                <div className={selectorStyles.customAreaButton} onClick={(e) => e.stopPropagation()}>
                  <ColorPicker
                    value={area.color}
                    onChange={(color) => updateCustomSimulationArea(area.id, { color: color.toHexString() })}
                    presets={COLOR_PRESETS}
                  >
                    <div className={selectorStyles.colorPickerDot} style={{ backgroundColor: area.color }} />
                  </ColorPicker>
                </div>
              </Tooltip>
              <Tooltip title={t('customAreas.deleteTooltip')}>
                <div
                  className={selectorStyles.customAreaButton}
                  onClick={(e) => {
                    e.stopPropagation()
                    removeCustomSimulationArea(area.id)
                  }}
                  style={{ color: 'red', fontSize: '14px' }}
                >
                  <DeleteOutlined />
                </div>
              </Tooltip>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export { DrawAreaList }
