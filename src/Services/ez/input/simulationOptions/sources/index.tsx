import { Select } from 'antd'
import { useAPIPayloadStore } from '~store'
import styles from '../simulationOptions.module.less'
import {
  populationYears,
  networkYears,
  publicTransportYears,
  populationSources,
  networkSources,
  publicTransportSources,
} from '~ez/data/sources'

type SourceType = 'population' | 'network' | 'publicTransport'
type SourceField = 'year' | 'name'

const SOURCE_CONFIGS = [
  {
    key: 'population' as SourceType,
    label: 'Population',
    years: populationYears,
    sources: populationSources
  },
  {
    key: 'network' as SourceType,
    label: 'Network',
    years: networkYears,
    sources: networkSources
  },
  {
    key: 'publicTransport' as SourceType,
    label: 'Public Transportation',
    years: publicTransportYears,
    sources: publicTransportSources
  }
] as const

const SourcesSection = () => {
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
      {SOURCE_CONFIGS.map(({ key, label, years, sources: sourcesData }) => {
        const currentSource = sources[key]

        return (
          <>
            <span className={styles.sourceLabel}><strong>{label}</strong></span>
            <Select
              value={currentSource.year}
              onChange={handleSourceChange(key, 'year')}
              className={styles.sourceSelect}
              options={years.map((year) => ({ value: year, label: year }))}
              aria-label={`${label} year selection`}
            />
            <Select
              value={currentSource.name}
              onChange={handleSourceChange(key, 'name')}
              className={styles.sourceSelect}
              options={sourcesData[currentSource.year]}
              aria-label={`${label} source selection`}
            />
          </>
        )
      })}
    </div>
  )
}

export default SourcesSection
