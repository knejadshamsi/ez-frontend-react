// Available years for data sources
export const populationYears = [2022, 2023, 2024] as const;
export const networkYears = [2022, 2023, 2024] as const;
export const publicTransportYears = [2022, 2023, 2024] as const;

export type Year = 2022 | 2023 | 2024;

interface DataSource {
  value: string;
  label: string;
}

type SourcesByYear = Record<Year, DataSource[]>;

// Data sources for each category by year
export const populationSources: SourcesByYear = {
  2022: [
    { value: 'census-2022', label: 'Census 2022' },
    { value: 'telus-2022', label: 'Telus Mobility 2022' }
  ],
  2023: [
    { value: 'telus-06-2023', label: 'Telus Mobility June 2023' },
    { value: 'telus-12-2023', label: 'Telus Mobility December 2023' }
  ],
  2024: [
    { value: 'telus-06-2024', label: 'Telus Mobility June 2024' },
    { value: 'telus-12-2024', label: 'Telus Mobility December 2024' }
  ]
};

export const networkSources: SourcesByYear = {
  2022: [
    { value: 'osm-2022', label: 'OpenStreetMap 2022' },
    { value: 'gov-2022', label: 'Government Data 2022' }
  ],
  2023: [
    { value: 'osm-2023', label: 'OpenStreetMap 2023' },
    { value: 'gov-2023', label: 'Government Data 2023' }
  ],
  2024: [
    { value: 'osm-2024', label: 'OpenStreetMap 2024' },
    { value: 'gov-2024', label: 'Government Data 2024' }
  ]
};

export const publicTransportSources: SourcesByYear = {
  2022: [
    { value: 'gtfs-2022', label: 'GTFS 2022' },
    { value: 'local-2022', label: 'Local Transit Data 2022' }
  ],
  2023: [
    { value: 'gtfs-2023', label: 'GTFS 2023' },
    { value: 'local-2023', label: 'Local Transit Data 2023' }
  ],
  2024: [
    { value: 'gtfs-2024', label: 'GTFS 2024' },
    { value: 'local-2024', label: 'Local Transit Data 2024' }
  ]
};
