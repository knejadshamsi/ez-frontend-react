import i18n from '~i18nConfig';

const locales = {
  en: {
    loadingScenario: 'Loading scenario, please wait.',
    buttons: {
      cancel: 'Cancel',
      close: 'Close',
      viewResults: 'View Early',
    },
    success: {
      title: 'Simulation Complete!',
      titleScenarioLoaded: 'Scenario Loaded!',
      withErrors: '{{count}} component(s) completed with errors',
    },
    error: {
      title: 'Simulation Error',
      fallback: 'Simulation failed',
      scenarioDeleted: 'This scenario has been deleted',
      scenarioCancelled: 'Scenario was cancelled',
      scenarioFailed: 'Scenario failed',
      backendNotConfigured: 'Backend URL not configured',
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
    cancellation: {
      inProgress: 'Cancelling simulation...',
      success: 'Simulation cancelled',
      failed: 'Failed to cancel simulation',
      timeout: 'Cancellation timed out - simulation may still be running',
      conflict: 'Simulation has already completed',
    },
    polling: {
      monitoring: 'Monitoring simulation progress...',
      subtitle: 'You will see results as soon as they are ready.',
      connectionLost: 'Connection to the server lost.',
      reconnectIn: 'Attempting to reconnect in {{seconds}}s...',
      reconnecting: 'Attempting to reconnect...',
      statusQueued: 'Simulation is queued',
      statusRunning: 'Simulation is running',
      batchSubtitle: 'You\'ll be redirected to results when complete.',
      failed: 'Simulation failed',
    },
    queued: {
      title: 'Simulation queued',
      subtitle: 'Waiting for available capacity...',
    },
    timeout: {
      connection: 'Could not connect to simulation server. Please check your connection and try again.',
      heartbeat: 'Connection to server was lost.',
      universal: 'Simulation timed out.',
    },
    batch: {
      startNew: 'Start a New',
      modal: {
        title: 'Start a New Simulation',
        content: 'Your current simulation will continue running in the background. Choose how to start your next simulation:',
        startFresh: 'Start Fresh',
        keepInputs: 'Keep Inputs',
        loadFromDraft: 'Load from Draft',
        draftIdPlaceholder: 'Enter Draft ID (d_...)',
        loadDraft: 'Load',
        draftLoadFailed: 'Failed to load draft',
        draftRestoreFailed: 'Draft data is invalid or corrupted. Starting fresh instead.',
        back: 'Back',
      },
    },
  },
  fr: {
    loadingScenario: 'Chargement du scénario, veuillez patienter.',
    buttons: {
      cancel: 'Annuler',
      close: 'Fermer',
      viewResults: 'Voir en avance',
    },
    success: {
      title: 'Simulation terminée !',
      titleScenarioLoaded: 'Scénario chargé !',
      withErrors: '{{count}} composant(s) terminé(s) avec des erreurs',
    },
    error: {
      title: 'Erreur de simulation',
      fallback: 'La simulation a echoue',
      scenarioDeleted: 'Ce scenario a ete supprime',
      scenarioCancelled: 'Le scenario a ete annule',
      scenarioFailed: 'Le scenario a echoue',
      backendNotConfigured: 'URL du serveur non configuree',
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
    cancellation: {
      inProgress: 'Annulation de la simulation...',
      success: 'Simulation annulée',
      failed: 'Échec de l\'annulation de la simulation',
      timeout: 'Délai d\'annulation dépassé - la simulation peut encore être en cours',
      conflict: 'La simulation est déjà terminée',
    },
    polling: {
      monitoring: 'Surveillance de la progression...',
      subtitle: 'Les resultats seront affiches des qu\'ils seront prets.',
      connectionLost: 'Connexion au serveur perdue.',
      reconnectIn: 'Tentative de reconnexion dans {{seconds}}s...',
      reconnecting: 'Tentative de reconnexion...',
      statusQueued: 'Simulation en file d\'attente',
      statusRunning: 'Simulation en cours',
      batchSubtitle: 'Vous serez redirige vers les resultats une fois termine.',
      failed: 'La simulation a echoue',
    },
    queued: {
      title: 'Simulation en file d\'attente',
      subtitle: 'En attente de capacite disponible...',
    },
    timeout: {
      connection: 'Impossible de se connecter au serveur de simulation. Veuillez vérifier votre connexion et réessayer.',
      heartbeat: 'La connexion au serveur a été perdue.',
      universal: 'La simulation a expiré.',
    },
    batch: {
      startNew: 'Nouveau',
      modal: {
        title: 'Demarrer une nouvelle simulation',
        content: 'Votre simulation actuelle continuera en arriere-plan. Choisissez comment demarrer votre prochaine simulation:',
        startFresh: 'Nouveau depart',
        keepInputs: 'Garder les parametres',
        loadFromDraft: 'Charger un brouillon',
        draftIdPlaceholder: 'Entrez l\'ID du brouillon (d_...)',
        loadDraft: 'Charger',
        draftLoadFailed: 'Echec du chargement du brouillon',
        draftRestoreFailed: 'Les donnees du brouillon sont invalides ou corrompues. Nouveau depart.',
        back: 'Retour',
      },
    },
  },
} as const;

i18n.addResourceBundle('en', 'ez-progress', locales.en);
i18n.addResourceBundle('fr', 'ez-progress', locales.fr);

