import { useState } from 'react'
import { Slider } from 'antd'
import { useAPIPayloadStore } from '~store'
import CarDistributionBar from './CarDistributionBar'
import styles from '../simulationOptions.module.less'

const MIN_VALUE = 1
const MAX_VALUE = 10

const generateMarks = (min: number, max: number, suffix: string = ''): Record<number, string> => {
  const marks: Record<number, string> = {}
  for (let i = min; i <= max; i++) {
    marks[i] = `${i}${suffix}`
  }
  return marks
}

const BasicSettingsSection = () => {
  const simulationOptions = useAPIPayloadStore((state) => state.payload.simulationOptions)
  const setSimulationOptions = useAPIPayloadStore((state) => state.setSimulationOptions)

  const [localIterations, setLocalIterations] = useState(simulationOptions.iterations)
  const [localPercentage, setLocalPercentage] = useState(simulationOptions.percentage)

  const handleSliderChange = (field: 'iterations' | 'percentage') => (value: number) => {
    if (field === 'iterations') {
      setLocalIterations(value)
    } else {
      setLocalPercentage(value)
    }
  }

  const handleSliderAfterChange = (field: 'iterations' | 'percentage') => (value: number) => {
    if (field === 'iterations') {
      setSimulationOptions({ iterations: value, percentage: simulationOptions.percentage })
    } else {
      setSimulationOptions({ iterations: simulationOptions.iterations, percentage: value })
    }
  }

  return (
    <div className={styles.optionsGroup}>
      <div className={styles.sliderSection}>
        <div className={styles.title}>
          <span><strong>Simulation Iterations</strong></span>
        </div>
        <div className={styles.description}>
          Higher number can lead to more accurate results at the cost of increased computation time.
        </div>
        <Slider
          min={MIN_VALUE}
          max={MAX_VALUE}
          value={localIterations}
          onChange={handleSliderChange('iterations')}
          onAfterChange={handleSliderAfterChange('iterations')}
          marks={generateMarks(MIN_VALUE, MAX_VALUE)}
          className={styles.slider}
          aria-label="Simulation iterations slider"
        />
      </div>

      <div className={styles.sliderSection}>
        <div className={styles.title}>
          <span><strong>Simulation Percentage</strong></span>
        </div>
        <div className={styles.description}>
          Higher percentage increases resolution at the cost of increased computation time.
        </div>
        <Slider
          min={MIN_VALUE}
          max={MAX_VALUE}
          value={localPercentage}
          onChange={handleSliderChange('percentage')}
          onAfterChange={handleSliderAfterChange('percentage')}
          marks={generateMarks(MIN_VALUE, MAX_VALUE, '%')}
          className={styles.slider}
          aria-label="Simulation percentage slider"
        />
      </div>

      <div className={styles.sliderSection}>
        <div className={styles.title}>
          <span><strong>Car Distribution</strong></span>
        </div>
        <div className={styles.description}>
          Adjust the distribution of vehicle types among car users. Drag dividers to change percentages.
        </div>
        <CarDistributionBar />
      </div>
    </div>
  )
}

export default BasicSettingsSection
