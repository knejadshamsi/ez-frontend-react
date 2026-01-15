import { Fragment } from 'react'
import { Select } from 'antd'
import { useTranslation } from 'react-i18next'
import { useAPIPayloadStore } from '~store'
import styles from '../simulationOptions.module.less'
import {
  populationYears,
  networkYears,
  publicTransportYears,
  populationSources,
  networkSources,
  publicTransportSources,
} from './sources'
import '../locales'

type SourceType = 'population' | 'network' | 'publicTransport'
type SourceField = 'year' | 'name'

const SOURCE_CONFIGS = [
  {
    key: 'population' as SourceType,
    years: populationYears,
    sources: populationSources
  },
  {
    key: 'network' as SourceType,
    years: networkYears,
    sources: networkSources
  },
  {
    key: 'publicTransport' as SourceType,
    years: publicTransportYears,
    sources: publicTransportSources
  }
] as const

const SourcesSection = () => {
  const { t } = useTranslation('ez-simulation-options')
  const sources = useAPIPayloadStore((state) => state.payload.sources)
  const setSources = useAPIPayloadStore((state) => state.setSources)

  const handleSourceChange = (sourceType: SourceType, field: SourceField) => (value: number | string) => {
    const currentSource = sources[sourceType]

    if (field === 'year') {
      const year = value as number
      const sourceData = SOURCE_CONFIGS.find(s => s.key === sourceType)
      const newName = sourceData?.sources[year]?.[0]?.value || currentSource.name

      setSources({
        ...sources,
        [sourceType]: { year, name: newName }
      })
    } else {
      setSources({
        ...sources,
        [sourceType]: { ...currentSource, name: value as string }
      })
    }
  }

  return (
    <div className={styles.sourcesGrid}>
      {SOURCE_CONFIGS.map(({ key, years, sources: sourcesData }) => {
        const currentSource = sources[key]
        const label = t(`dataSources.sourceTypes.${key}`)

        return (
          <Fragment key={key}>
            <span className={styles.sourceLabel}><strong>{label}</strong></span>
            <Select
              value={currentSource.year}
              onChange={handleSourceChange(key, 'year')}
              className={styles.sourceSelect}
              options={years.map((year) => ({ value: year, label: year }))}
              aria-label={t('dataSources.ariaLabels.yearSelection', { sourceType: label })}
            />
            <Select
              value={currentSource.name}
              onChange={handleSourceChange(key, 'name')}
              className={styles.sourceSelect}
              options={sourcesData[currentSource.year]}
              aria-label={t('dataSources.ariaLabels.sourceSelection', { sourceType: label })}
            />
          </Fragment>
        )
      })}
    </div>
  )
}

export default SourcesSection
