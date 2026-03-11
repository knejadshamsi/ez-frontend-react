import i18n from '~i18nConfig';

const locales = {
  en: {
    emissionsBar: {
      description: 'Breakdown by pollutant type comparing baseline and post-policy emissions.',
      error: 'Failed to load emissions bar chart',
      retry: 'Retry',
      legend: {
        baseline: 'Baseline',
        postPolicy: 'Post-Policy',
      },
    },
    emissionsLine: {
      description: 'Time-binned emissions over the simulation duration, comparing baseline and post-policy scenarios.',
      error: 'Failed to load emissions line chart',
      retry: 'Retry',
      legend: {
        baseline: 'Baseline',
        policy: 'Post-Policy',
      },
    },
    emissionsStackedBar: {
      description: 'Private vehicle emissions by vehicle emission category, showing the contribution of each type to total emissions.',
      error: 'Failed to load vehicle emissions chart',
      retry: 'Retry',
      labels: {
        baseline: 'Baseline',
        policy: 'Post-Policy',
      },
      vehicleTypes: {
        zeroEmission: 'Zero Emission',
        nearZeroEmission: 'Near-Zero Emission',
        lowEmission: 'Low Emission',
        midEmission: 'Mid Emission',
        highEmission: 'High Emission',
      },
    },
    warmColdIntensity: {
      error: 'Failed to load warm/cold intensity data',
      retry: 'Retry',
      noEmissions: 'No emissions detected in this simulation.',
    },
    peopleResponseSankey: {
      description: 'Mode transition diagram showing how travelers shifted between transport modes.',
      error: 'Failed to load mode transition diagram',
      retry: 'Retry',
      headers: {
        baseline: 'Baseline',
        postPolicy: 'Post-Policy',
      },
      noFlows: 'No flows to display',
    },
    peopleResponseBar: {
      description: 'Breakdown of travelers who changed their mode of transport.',
      error: 'Failed to load mode share chart',
      retry: 'Retry',
    },
  },
  fr: {
    emissionsBar: {
      description: 'Repartition par type de polluant comparant les emissions de reference et post-politique.',
      error: 'Echec du chargement du graphique a barres des emissions',
      retry: 'Reessayer',
      legend: {
        baseline: 'Reference',
        postPolicy: 'Post-politique',
      },
    },
    emissionsLine: {
      description: 'Emissions par intervalles de temps sur la duree de la simulation, comparant les scenarios de reference et post-politique.',
      error: 'Echec du chargement du graphique en ligne des emissions',
      retry: 'Reessayer',
      legend: {
        baseline: 'Reference',
        policy: 'Post-politique',
      },
    },
    emissionsStackedBar: {
      description: 'Emissions des vehicules prives par categorie d\'emission, montrant la contribution de chaque type aux emissions totales.',
      error: 'Echec du chargement du graphique des emissions par vehicule',
      retry: 'Reessayer',
      labels: {
        baseline: 'Reference',
        policy: 'Post-politique',
      },
      vehicleTypes: {
        zeroEmission: 'Zero emission',
        nearZeroEmission: 'Quasi zero emission',
        lowEmission: 'Faible emission',
        midEmission: 'Emission moyenne',
        highEmission: 'Haute emission',
      },
    },
    warmColdIntensity: {
      error: 'Echec du chargement des donnees d\'intensite chaude/froide',
      retry: 'Reessayer',
      noEmissions: 'Aucune emission detectee dans cette simulation.',
    },
    peopleResponseSankey: {
      description: 'Diagramme de transition modale montrant comment les voyageurs ont change de mode de transport.',
      error: 'Echec du chargement du diagramme de transition modale',
      retry: 'Reessayer',
      headers: {
        baseline: 'Reference',
        postPolicy: 'Post-politique',
      },
      noFlows: 'Aucun flux a afficher',
    },
    peopleResponseBar: {
      description: 'Repartition des voyageurs ayant change de mode de transport.',
      error: 'Echec du chargement du graphique de parts modales',
      retry: 'Reessayer',
    },
  },
} as const;

i18n.addResourceBundle('en', 'ez-output-charts', locales.en);
i18n.addResourceBundle('fr', 'ez-output-charts', locales.fr);
