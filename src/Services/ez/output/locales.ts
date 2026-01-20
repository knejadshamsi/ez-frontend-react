import i18n from '~i18nConfig';

export const locales = {
  en: {
    backToParameters: 'Back to Parameter Selection',
    sections: {
      emissions: '1. Emissions and Comparisons',
      peopleResponse: '2. People Response',
      legPerformance: '3. Leg Performance',
    },
    editParametersModal: {
      title: 'Edit Parameters',
      content: 'Do you want to keep the current inputs and modify them, or reset all inputs?',
      keepInputs: 'Keep Inputs',
      reset: 'Reset',
      cancel: 'Cancel',
    },
    overview: {
      title: 'Output',
      loadingTip: 'Loading overview data...',
      error: 'Failed to load overview data',
      retry: 'Retry',
      description: 'The simulation included <strong>{{totalPersonCount}}</strong> people and analyzed <strong>{{totalLegCount}}</strong> legs over a 24-hour period, covering an area of <strong>{{totalAreaCoverageKm2}}</strong> km² with a network of <strong>{{totalNetworkNodes}}</strong> nodes and <strong>{{totalNetworkLinks}}</strong> links, analyzing a total of <strong>{{totalKilometersTraveled}}</strong> km traveled.',
    },
    layerToggle: {
      zones: 'Zones',
      areas: 'Areas',
      tooltipZone: 'Cycle zone layer opacity',
      tooltipArea: 'Cycle area layer opacity',
      opacityHidden: 'Hidden',
      opacityNormal: 'Normal',
    },
    paragraphs: {
      emissions1Error: 'Failed to load emissions comparison data',
      emissions2Error: 'Failed to load air quality data',
      peopleResponse1Error: 'Failed to load behavioral response data',
      peopleResponse2Error: 'Failed to load time impact data',
      retry: 'Retry',
    },
  },
  fr: {
    backToParameters: 'Retour à la sélection des paramètres',
    sections: {
      emissions: '1. Émissions et comparaisons',
      peopleResponse: '2. Réponse des personnes',
      legPerformance: '3. Performance des segments',
    },
    editParametersModal: {
      title: 'Modifier les paramètres',
      content: 'Voulez-vous conserver les entrées actuelles et les modifier, ou réinitialiser toutes les entrées?',
      keepInputs: 'Conserver les entrées',
      reset: 'Réinitialiser',
      cancel: 'Annuler',
    },
    overview: {
      title: 'Résultats',
      loadingTip: 'Chargement des données de vue d\'ensemble...',
      error: 'Échec du chargement des données de vue d\'ensemble',
      retry: 'Réessayer',
      description: 'La simulation a inclus <strong>{{totalPersonCount}}</strong> personnes et a analysé <strong>{{totalLegCount}}</strong> segments sur une période de 24 heures, couvrant une superficie de <strong>{{totalAreaCoverageKm2}}</strong> km² avec un réseau de <strong>{{totalNetworkNodes}}</strong> nœuds et <strong>{{totalNetworkLinks}}</strong> liens, analysant un total de <strong>{{totalKilometersTraveled}}</strong> km parcourus.',
    },
    layerToggle: {
      zones: 'Zones',
      areas: 'Aires',
      tooltipZone: 'Alterner l\'opacité de la couche de zone',
      tooltipArea: 'Alterner l\'opacité de la couche d\'aire',
      opacityHidden: 'Masqué',
      opacityNormal: 'Normal',
    },
    paragraphs: {
      emissions1Error: 'Échec du chargement des données de comparaison des émissions',
      emissions2Error: 'Échec du chargement des données de qualité de l\'air',
      peopleResponse1Error: 'Échec du chargement des données de réponse comportementale',
      peopleResponse2Error: 'Échec du chargement des données d\'impact sur le temps',
      retry: 'Réessayer',
    },
  },
} as const;

i18n.addResourceBundle('en', 'ez-output', locales.en);
i18n.addResourceBundle('fr', 'ez-output', locales.fr);

export type EZOutputLocale = typeof locales.en;
