import i18n from '~i18nConfig';

export const locales = {
  en: {
    emissionsBar: {
      description: 'Breakdown by pollutant type comparing baseline and post-policy emissions.',
      error: 'Failed to load emissions bar chart',
      retry: 'Retry',
      legend: {
        baseline: 'Baseline (tonnes/day)',
        postPolicy: 'Post-Policy (tonnes/day)',
      },
    },
    vehicleFleet: {
      description: 'Vehicle type contribution to total emissions, showing the shift in fleet composition between baseline and post-policy scenarios.',
      error: 'Failed to load vehicle emissions chart',
      retry: 'Retry',
      labels: {
        baseline: 'Baseline',
        postPolicy: 'Post-Policy',
      },
    },
    responseBreakdown: {
      description: 'Breakdown of behavioral responses across all affected trips.',
      error: 'Failed to load response breakdown chart',
      retry: 'Retry',
    },
    timeImpact: {
      description: 'Average trip time impact for each behavioral response, illustrating the time cost of different adaptation strategies.',
      error: 'Failed to load time impact chart',
      retry: 'Retry',
      datasetLabel: 'Avg Time Delta (min)',
      yAxisTitle: 'Avg Time Delta (min)',
    },
  },
  fr: {
    emissionsBar: {
      description: 'Répartition par type de polluant comparant les émissions de référence et post-politique.',
      error: 'Échec du chargement du graphique à barres des émissions',
      retry: 'Réessayer',
      legend: {
        baseline: 'Référence (tonnes/jour)',
        postPolicy: 'Post-politique (tonnes/jour)',
      },
    },
    vehicleFleet: {
      description: 'Contribution de chaque type de véhicule aux émissions totales, montrant le changement dans la composition de la flotte entre les scénarios de référence et post-politique.',
      error: 'Échec du chargement du graphique des émissions des véhicules',
      retry: 'Réessayer',
      labels: {
        baseline: 'Référence',
        postPolicy: 'Post-politique',
      },
    },
    responseBreakdown: {
      description: 'Répartition des réponses comportementales pour tous les trajets affectés.',
      error: 'Échec du chargement du graphique de répartition des réponses',
      retry: 'Réessayer',
    },
    timeImpact: {
      description: 'Impact moyen sur le temps de trajet pour chaque réponse comportementale, illustrant le coût en temps des différentes stratégies d\'adaptation.',
      error: 'Échec du chargement du graphique d\'impact sur le temps',
      retry: 'Réessayer',
      datasetLabel: 'Variation moyenne de temps (min)',
      yAxisTitle: 'Variation moyenne de temps (min)',
    },
  },
} as const;

i18n.addResourceBundle('en', 'ez-output-charts', locales.en);
i18n.addResourceBundle('fr', 'ez-output-charts', locales.fr);

export type EZOutputChartsLocale = typeof locales.en;
