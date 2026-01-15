import i18n from '~i18nConfig';

export const locales = {
  en: {
    loadingScenario: 'Loading scenario, please wait.',
    buttons: {
      cancel: 'Cancel',
      close: 'Close',
      viewResults: 'View Results',
    },
    success: {
      title: 'Simulation Complete!',
    },
    error: {
      title: 'Simulation Error',
    },
    progress: {
      title: 'Simulation Progress',
    },
    phases: {
      preprocessing: 'Preprocessing',
      simulating: 'Simulating',
      postProcessing: 'Post Processing',
    },
    steps: {
      preprocessing_population: 'Population data',
      preprocessing_network: 'Network data',
      preprocessing_transit: 'Transit data',
      preprocessing_config: 'Configuration',
      simulation_base: 'Baseline scenario',
      simulation_policy: 'Policy scenario',
      postprocessing_overview: 'Overview',
      postprocessing_emissions: 'Emissions',
      postprocessing_people_response: 'People Response',
      postprocessing_trip_legs: 'Trip Legs',
    },
  },
  fr: {
    loadingScenario: 'Chargement du scénario, veuillez patienter.',
    buttons: {
      cancel: 'Annuler',
      close: 'Fermer',
      viewResults: 'Voir les résultats',
    },
    success: {
      title: 'Simulation terminée !',
    },
    error: {
      title: 'Erreur de simulation',
    },
    progress: {
      title: 'Progression de la simulation',
    },
    phases: {
      preprocessing: 'Prétraitement',
      simulating: 'Simulation',
      postProcessing: 'Post-traitement',
    },
    steps: {
      preprocessing_population: 'Données de population',
      preprocessing_network: 'Données du réseau',
      preprocessing_transit: 'Données de transport',
      preprocessing_config: 'Configuration',
      simulation_base: 'Scénario de référence',
      simulation_policy: 'Scénario de politique',
      postprocessing_overview: 'Aperçu',
      postprocessing_emissions: 'Émissions',
      postprocessing_people_response: 'Réponse des personnes',
      postprocessing_trip_legs: 'Segments de trajet',
    },
  },
} as const;

i18n.addResourceBundle('en', 'ez-progress', locales.en);
i18n.addResourceBundle('fr', 'ez-progress', locales.fr);

export type EZProgressLocale = typeof locales.en;
