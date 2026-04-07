import i18n from '~i18nConfig';

const locales = {
  en: {
    backToParameters: 'Back to Parameter Selection',
    sections: {
      emissions: '1. Emissions and Comparisons',
      peopleResponse: '2. People Response',
      legPerformance: '3. Trip Performance',
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
      descriptionPre: 'The simulation included',
      descriptionPeople: 'people and analyzed',
      descriptionLegs: 'legs over a 24-hour period, covering an area of',
      descriptionNetwork: 'with a network of',
      descriptionNodes: 'nodes and',
      descriptionLinks: 'links, analyzing a total of',
      descriptionPost: 'traveled',
      descriptionSample: 'sample',
    },
    pollutantSelector: {
      all: 'All',
    },
    layerToggle: {
      zones: 'Zones',
      areas: 'Areas',
      tooltipZone: 'Cycle zone layer opacity',
      tooltipArea: 'Cycle area layer opacity',
      opacityHidden: 'Hidden',
      opacityNormal: 'Normal',
    },
    pin: {
      tooltipPin: 'Pin scenario',
      tooltipUnpin: 'Unpin scenario',
      tooltipDisabled: 'Pinning unavailable',
      pinFailed: 'Failed to toggle pin',
    },
    paragraphs: {
      emissions1Error: 'Failed to load emissions comparison data',
      emissions2Error: 'Failed to load air quality data',
      peopleResponse1Error: 'Failed to load behavioral response data',
      tripPerformanceError: 'Failed to load trip performance data',
      retry: 'Retry',
    },
  },
  fr: {
    backToParameters: 'Retour à la sélection des paramètres',
    sections: {
      emissions: '1. Émissions et comparaisons',
      peopleResponse: '2. Réponse des personnes',
      legPerformance: '3. Performance des deplacements',
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
      descriptionPre: 'La simulation a inclus',
      descriptionPeople: 'personnes et a analyse',
      descriptionLegs: 'segments sur une periode de 24 heures, couvrant une superficie de',
      descriptionNetwork: 'avec un reseau de',
      descriptionNodes: 'noeuds et',
      descriptionLinks: 'liens, analysant un total de',
      descriptionPost: 'parcourus',
      descriptionSample: 'echantillon',
    },
    pollutantSelector: {
      all: 'Tous',
    },
    layerToggle: {
      zones: 'Zones',
      areas: 'Aires',
      tooltipZone: 'Alterner l\'opacité de la couche de zone',
      tooltipArea: 'Alterner l\'opacité de la couche d\'aire',
      opacityHidden: 'Masqué',
      opacityNormal: 'Normal',
    },
    pin: {
      tooltipPin: 'Epingler le scenario',
      tooltipUnpin: 'Desepingler le scenario',
      tooltipDisabled: 'Epinglage indisponible',
      pinFailed: 'Echec du basculement de l\'epingle',
    },
    paragraphs: {
      emissions1Error: 'Échec du chargement des données de comparaison des émissions',
      emissions2Error: 'Échec du chargement des données de qualité de l\'air',
      peopleResponse1Error: 'Échec du chargement des données de réponse comportementale',
      tripPerformanceError: 'Echec du chargement des donnees de performance des deplacements',
      retry: 'Reessayer',
    },
  },
} as const;

i18n.addResourceBundle('en', 'ez-output', locales.en);
i18n.addResourceBundle('fr', 'ez-output', locales.fr);
