import { type ReactElement } from 'react'
import { DeleteOutlined, FormOutlined } from '@ant-design/icons'
import { ColorPicker } from 'antd'
import { useAPIPayloadStore, useEZServiceStore } from '~store'
import { useEZSessionStore } from '~stores/session'
import { colorShader } from '~ez/utils/colorUtils'
import { generateDefaultName } from '~ez/utils/namingUtils'
import { InlineNameEditor } from '~ez/components/InlineNameEditor'
import selectorStyles from '~ez/styles/simulationAreaSelector.module.less'
import type { CustomSimulationArea } from '~ez/stores/types'
import type { AreaColorPreset } from './types'

const DEFAULT_CUSTOM_AREA_COLOR = '#00BCD4'

const COLOR_PRESETS: AreaColorPreset[] = [
  {
    label: 'Recommended',
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

const DrawAreaList = (): ReactElement => {
  const customSimulationAreas = useAPIPayloadStore((state) => state.payload.customSimulationAreas)
  const removeCustomSimulationArea = useAPIPayloadStore((state) => state.removeCustomSimulationArea)
  const updateCustomSimulationArea = useAPIPayloadStore((state) => state.updateCustomSimulationArea)
  const setState = useEZServiceStore((state) => state.setState)
  const setActiveCustomArea = useEZSessionStore((state) => state.setActiveCustomArea)

  return (
    <div className={selectorStyles.drawAreaContainer}>
      {customSimulationAreas.length === 0 ? (
        <div className={selectorStyles.emptyStateMessage}>No custom areas added yet</div>
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
            <FormOutlined
              onClick={() => {
                if (area.coords) {
                  setActiveCustomArea(area.id)
                  setState('EDIT_SIM_AREA')
                }
              }}
              style={{
                cursor: area.coords ? 'pointer' : 'not-allowed',
                color: area.coords ? '#1890ff' : '#d9d9d9',
                fontSize: '16px',
                marginLeft: '8px'
              }}
              title={area.coords ? 'Edit area boundaries' : 'Draw area first'}
            />
            <ColorPicker
              value={area.color}
              onChange={(color) => updateCustomSimulationArea(area.id, { color: color.toHexString() })}
              presets={COLOR_PRESETS}
            >
              <div className={selectorStyles.colorPickerDot} style={{ backgroundColor: area.color }} />
            </ColorPicker>
            <DeleteOutlined
              onClick={() => removeCustomSimulationArea(area.id)}
              style={{ cursor: 'pointer', color: 'red' }}
            />
          </div>
        ))
      )}
    </div>
  )
}

export { DrawAreaList }
