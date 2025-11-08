import { Divider } from 'antd'
import BasicSettingsSection from './basicSettings'
import SourcesSection from './sources'
import ModeUtilityAdjustments from './ModeUtilityAdjustments'

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

          <div className={styles.subsectionContainer}>
            <span className={styles.sectionHeader}><strong>DATA SOURCES</strong></span>
            <div className={styles.descriptionText}>
              Select datasets for the simulation
            </div>
            <SourcesSection />
          </div>

          <div className={styles.subsectionContainer}>
            <span className={styles.sectionHeader}><strong>ATTRACTIVENESS</strong></span>
            <div className={styles.descriptionText}>
              Left-click for positive values (more attractive), right-click for negative values (less attractive)
            </div>
            <ModeUtilityAdjustments />
          </div>
        </div>
      </div>
    </>
  )
}

export { SimulationOptionsSection }
