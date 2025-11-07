import { EmissionZoneSection } from './emissionZoneSection'
import { SimulationAreaSection } from './simulationAreaSection/'
import { SimulationOptionsSection } from './simulationOptions'

import styles from './inputContainer.module.less'

const InputContainer = () => {
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
