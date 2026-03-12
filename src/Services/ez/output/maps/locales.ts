import i18n from '~i18nConfig';

const locales = {
  en: {
    emissions: {
      title: 'Emissions Map Visualization',
      description: 'Interactive map showing emissions distribution across the network',
      loadingTip: 'Preparing emissions map...',
      controls: {
        scenario: 'Scenario',
        visualizationType: 'Visualization Type',
        viewMode: 'View Mode',
      },
      scenarios: {
        baseline: 'Baseline',
        policy: 'Post-Policy',
      },
      visualizationTypes: {
        hexagon: 'Hex Layer',
        heatmap: 'Heat Map',
      },
      viewModes: {
        private: 'Private Only',
        all: 'All Vehicles',
      },
    },
    peopleResponse: {
      title: 'People Response Map',
      description: 'Screen grid visualization showing spatial distribution of behavioral responses',
      loadingTip: 'Preparing people response map...',
      controls: {
        viewType: 'View Type',
        responseCategory: 'Response Categories',
      },
      viewTypes: {
        origin: 'Origin',
        destination: 'Destination',
      },
      categories: {
        modeShift: 'Mode Shift',
        rerouted: 'Rerouted',
        paidPenalty: 'Paid Penalty',
        cancelled: 'Cancelled',
      },
    },
    tripLegs: {
      loadingTip: 'Preparing trip performance map...',
    },
  },
  fr: {
    emissions: {
      title: 'Visualisation de la carte des émissions',
      description: 'Carte interactive montrant la distribution des émissions sur le réseau',
      loadingTip: 'Préparation de la carte des émissions...',
      controls: {
        scenario: 'Scenario',
        visualizationType: 'Type de visualisation',
        viewMode: 'Mode de vue',
      },
      scenarios: {
        baseline: 'Reference',
        policy: 'Post-politique',
      },
      visualizationTypes: {
        hexagon: 'Couche hexagonale',
        heatmap: 'Carte de chaleur',
      },
      viewModes: {
        private: 'Vehicules prives',
        all: 'Tous les vehicules',
      },
    },
    peopleResponse: {
      title: 'Carte de réponse des personnes',
      description: 'Visualisation en grille montrant la distribution spatiale des réponses comportementales',
      loadingTip: 'Préparation de la carte de réponse des personnes...',
      controls: {
        viewType: 'Type de vue',
        responseCategory: 'Categories de reponse',
      },
      viewTypes: {
        origin: 'Origine',
        destination: 'Destination',
      },
      categories: {
        modeShift: 'Changement de mode',
        rerouted: 'Reachemine',
        paidPenalty: 'Penalite payee',
        cancelled: 'Annule',
      },
    },
    tripLegs: {
      loadingTip: 'Preparation de la carte de performance...',
    },
  },
} as const;

i18n.addResourceBundle('en', 'ez-output-maps', locales.en);
i18n.addResourceBundle('fr', 'ez-output-maps', locales.fr);

