export const populationYears = [2024, 2025] as const;
export const networkYears = [2025] as const;
export const publicTransportYears = [2024, 2025] as const;

export type Year = 2024 | 2025;

interface DataSource {
  value: string;
  label: string;
}

type SourcesByYear = Partial<Record<Year, DataSource[]>>;

export const populationSources: SourcesByYear = {
  2024: [
    { value: 'montreal-polytechnique-pipeline-2024', label: 'Montreal Polytechnique Pipeline' }
  ],
  2025: [
    { value: 'montreal-polytechnique-pipeline-2025', label: 'Montreal Polytechnique Pipeline' }
  ]
};

export const networkSources: SourcesByYear = {
  2025: [
    { value: 'osm-2025', label: 'OpenStreetMap' }
  ]
};

export const publicTransportSources: SourcesByYear = {
  2024: [
    { value: 'stm-gtfs-2024', label: 'STM GTFS' }
  ],
  2025: [
    { value: 'stm-gtfs-2025', label: 'STM GTFS' }
  ]
};
