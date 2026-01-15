import { Divider } from 'antd'
import { useTranslation } from 'react-i18next'
import BasicSettingsSection from './basicSettings'
import SourcesSection from './sources'
import ModeUtilityAdjustments from './ModeUtilityAdjustments'

import styles from './simulationOptions.module.less'
import './locales'

const SimulationOptionsSection = () => {
  const { t } = useTranslation('ez-simulation-options')

  return (
    <>
      <Divider orientationMargin={10} orientation="left" className={`${styles.divider} ${styles.boldText}`}>
        <strong>{t('section.title')}</strong>
      </Divider>
      <div className={`${styles.container} ${styles.simulationOptionsContainer}`}>
        <div className={styles.sectionContainer}>
          <div className={styles.subsectionContainer}>
            <span className={styles.sectionHeader}><strong>{t('basicSettings.title')}</strong></span>
            <div className={styles.descriptionText}>
              {t('basicSettings.description')}
            </div>
            <BasicSettingsSection />
          </div>

          <div className={styles.subsectionContainer}>
            <span className={styles.sectionHeader}><strong>{t('dataSources.title')}</strong></span>
            <div className={styles.descriptionText}>
              {t('dataSources.description')}
            </div>
            <SourcesSection />
          </div>

          <div className={styles.subsectionContainer}>
            <span className={styles.sectionHeader}><strong>{t('attractiveness.title')}</strong></span>
            <div className={styles.descriptionText}>
              {t('attractiveness.description')}
            </div>
            <ModeUtilityAdjustments />
          </div>
        </div>
      </div>
    </>
  )
}

export { SimulationOptionsSection }
