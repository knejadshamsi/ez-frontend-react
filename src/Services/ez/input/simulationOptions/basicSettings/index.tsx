import { useState } from 'react'
import { Slider } from 'antd'
import { useTranslation } from 'react-i18next'
import { useAPIPayloadStore } from '~store'
import CarDistributionBar from './CarDistributionBar'
import styles from '../simulationOptions.module.less'
import '../locales'

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
  const { t } = useTranslation('ez-simulation-options')
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
          <span><strong>{t('basicSettings.iterations.title')}</strong></span>
        </div>
        <div className={styles.description}>
          {t('basicSettings.iterations.description')}
        </div>
        <Slider
          min={MIN_VALUE}
          max={MAX_VALUE}
          value={localIterations}
          onChange={handleSliderChange('iterations')}
          onAfterChange={handleSliderAfterChange('iterations')}
          marks={generateMarks(MIN_VALUE, MAX_VALUE)}
          className={styles.slider}
          aria-label={t('basicSettings.iterations.ariaLabel')}
          tooltip={{ open: false }}
        />
      </div>

      <div className={styles.sliderSection}>
        <div className={styles.title}>
          <span><strong>{t('basicSettings.percentage.title')}</strong></span>
        </div>
        <div className={styles.description}>
          {t('basicSettings.percentage.description')}
        </div>
        <Slider
          min={MIN_VALUE}
          max={MAX_VALUE}
          value={localPercentage}
          onChange={handleSliderChange('percentage')}
          onAfterChange={handleSliderAfterChange('percentage')}
          marks={generateMarks(MIN_VALUE, MAX_VALUE, '%')}
          className={styles.slider}
          aria-label={t('basicSettings.percentage.ariaLabel')}
          tooltip={{ open: false }}
        />
      </div>

      <div className={styles.sliderSection}>
        <div className={styles.title}>
          <span><strong>{t('basicSettings.vehicleDistribution.title')}</strong></span>
        </div>
        <div className={styles.description}>
          {t('basicSettings.vehicleDistribution.description')}
        </div>
        <CarDistributionBar />
      </div>
    </div>
  )
}

export default BasicSettingsSection
