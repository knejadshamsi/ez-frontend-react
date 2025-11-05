import { EmissionZoneSection } from './emissionZoneSection'

import styles from './inputContainer.module.less'

const InputContainer = () => {
  return (
    <div style={{overflow: 'hidden'}}>
      <div className={`${styles.formSpace} ${styles.customScroll}`}>
        <EmissionZoneSection />
      </div>
    </div>
  )
}

export { InputContainer }
