import { EmissionZoneSection } from './emissionZoneSection'
import { SimulationAreaSection } from './simulationAreaSection/'
import { SimulationOptionsSection } from './simulationOptions'
import { useAutoTranslateDefaultNames } from './useAutoTranslateDefaultNames'

import styles from './inputContainer.module.less'

const InputContainer = () => {
  
  useAutoTranslateDefaultNames()

  return (
    <div style={{overflow: 'hidden'}}>
      <div className={`${styles.formSpace} ${styles.customScroll}`}>
        <EmissionZoneSection />
        <SimulationAreaSection />
        <SimulationOptionsSection />
      </div>
    </div>
  )
}

export { InputContainer }
