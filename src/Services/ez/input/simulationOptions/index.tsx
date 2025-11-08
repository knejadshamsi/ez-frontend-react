import { Divider } from 'antd'
import BasicSettingsSection from './basicSettings'

import styles from './simulationOptions.module.less'

const SimulationOptionsSection = () => {

  return (
    <>
      <Divider orientationMargin={10} orientation="left" className={`${styles.divider} ${styles.boldText}`}>
        <strong>3. SIMULATION OPTIONS</strong>
      </Divider>
      <div className={`${styles.container} ${styles.simulationOptionsContainer}`}>
        <div className={styles.sectionContainer}>
          <div className={styles.subsectionContainer}>
            <span className={styles.sectionHeader}><strong>BASIC SETTINGS</strong></span>
            <div className={styles.descriptionText}>
              Configure simulation iterations and population coverage
            </div>
            <BasicSettingsSection />
          </div>
        </div>
      </div>
    </>
  )
}

export { SimulationOptionsSection }
