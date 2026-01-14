import i18n from '~i18nConfig';

export const locales = {
  en: {
    exitWarnings: {
      inputDataLost: {
        title: 'Input Data Will Be Lost',
        message: 'You have configured input parameters. All input data will be lost. Continue?',
      },
      unsavedConfiguration: {
        title: 'Unsaved Configuration',
        message: 'You have configured emission zones and parameters. Session will be lost. Continue?',
      },
      unsavedEmissionZone: {
        title: 'Unsaved Emission Zone',
        message: 'You have an unsaved emission zone. Session will be lost. Continue?',
      },
      unsavedChangesZone: {
        title: 'Unsaved Changes',
        message: 'You have unsaved changes to the emission zone. Session will be lost. Continue?',
      },
      zoneRedrawInProgress: {
        title: 'Zone Redraw in Progress',
        message: 'You are redrawing an emission zone. Session will be lost. Continue?',
      },
      unsavedSimulationArea: {
        title: 'Unsaved Simulation Area',
        message: 'You have an unsaved simulation area. Session will be lost. Continue?',
      },
      unsavedChangesArea: {
        title: 'Unsaved Changes',
        message: 'You have unsaved changes to the simulation area. Session will be lost. Continue?',
      },
      simulationInProgress: {
        title: 'Simulation in Progress',
        message: 'The simulation is currently running and will be aborted. All progress will be lost. Continue?',
      },
      sessionWillBeLost: {
        title: 'Session Will Be Lost',
        message: 'Session will be lost. Make sure to save your request ID before exiting. Continue?',
      },
    },
    connectionMessages: {
      backendOnlineNewSim: 'Connection established! Backend is now online. Please start your simulation again.',
      backendOnlineLoadScenario: 'Connection established! Backend is now online. Please load your scenario again.',
    },
    validation: {
      outsideBoundary: 'The drawn area must be entirely within the Montreal region boundary.',
      areaTooSmall: 'The drawn area is too small. Minimum area: {{min}} km² (current: {{current}} km²)',
      areaTooLarge: 'The drawn area is too large. Maximum area: {{max}} km² (current: {{current}} km²)',
      validationFailed: 'Failed to validate polygon. Please try drawing again.',
    },
    header: {
      exit: 'Exit',
      toggleLanguage: 'Toggle language',
    },
    stepTitles: {
      welcome: 'Welcome',
      parameterSelection: 'Parameter Selection',
      drawEmissionZone: 'Draw Emission Zone',
      editEmissionZone: 'Edit Emission Zone',
      redrawEmissionZone: 'Redraw Emission Zone',
      drawSimulationArea: 'Draw Simulation Area',
      editSimulationArea: 'Edit Simulation Area',
      processing: 'Processing',
      viewResults: 'View Results',
    },
    retryConnection: {
      tooltip: 'Retry connection to live backend',
      success: 'Connected to live backend',
      failed: 'Failed to connect to backend',
      configError: 'Backend configuration error',
    },
    demoMode: {
      label: 'DEMO MODE',
    },
  },
  fr: {
    exitWarnings: {
      inputDataLost: {
        title: 'Données d\'entrée seront perdues',
        message: 'Vous avez configuré des paramètres d\'entrée. Toutes les données seront perdues. Continuer?',
      },
      unsavedConfiguration: {
        title: 'Configuration non sauvegardée',
        message: 'Vous avez configuré des zones d\'émission et des paramètres. La session sera perdue. Continuer?',
      },
      unsavedEmissionZone: {
        title: 'Zone d\'émission non sauvegardée',
        message: 'Vous avez une zone d\'émission non sauvegardée. La session sera perdue. Continuer?',
      },
      unsavedChangesZone: {
        title: 'Modifications non sauvegardées',
        message: 'Vous avez des modifications non sauvegardées à la zone d\'émission. La session sera perdue. Continuer?',
      },
      zoneRedrawInProgress: {
        title: 'Redessin de zone en cours',
        message: 'Vous êtes en train de redessiner une zone d\'émission. La session sera perdue. Continuer?',
      },
      unsavedSimulationArea: {
        title: 'Zone de simulation non sauvegardée',
        message: 'Vous avez une zone de simulation non sauvegardée. La session sera perdue. Continuer?',
      },
      unsavedChangesArea: {
        title: 'Modifications non sauvegardées',
        message: 'Vous avez des modifications non sauvegardées à la zone de simulation. La session sera perdue. Continuer?',
      },
      simulationInProgress: {
        title: 'Simulation en cours',
        message: 'La simulation est en cours d\'exécution et sera interrompue. Tous les progrès seront perdus. Continuer?',
      },
      sessionWillBeLost: {
        title: 'Session sera perdue',
        message: 'La session sera perdue. Assurez-vous de sauvegarder votre ID de requête avant de quitter. Continuer?',
      },
    },
    connectionMessages: {
      backendOnlineNewSim: 'Connexion établie! Le serveur est maintenant en ligne. Veuillez redémarrer votre simulation.',
      backendOnlineLoadScenario: 'Connexion établie! Le serveur est maintenant en ligne. Veuillez recharger votre scénario.',
    },
    validation: {
      outsideBoundary: 'La zone dessinée doit être entièrement dans les limites de la région de Montréal.',
      areaTooSmall: 'La zone dessinée est trop petite. Superficie minimale: {{min}} km² (actuelle: {{current}} km²)',
      areaTooLarge: 'La zone dessinée est trop grande. Superficie maximale: {{max}} km² (actuelle: {{current}} km²)',
      validationFailed: 'Échec de la validation du polygone. Veuillez réessayer de dessiner.',
    },
    header: {
      exit: 'Sortir',
      toggleLanguage: 'Changer de langue',
    },
    stepTitles: {
      welcome: 'Bienvenue',
      parameterSelection: 'Sélection des paramètres',
      drawEmissionZone: 'Dessiner zone d\'émission',
      editEmissionZone: 'Modifier zone d\'émission',
      redrawEmissionZone: 'Redessiner zone d\'émission',
      drawSimulationArea: 'Dessiner zone de simulation',
      editSimulationArea: 'Modifier zone de simulation',
      processing: 'Traitement',
      viewResults: 'Voir les résultats',
    },
    retryConnection: {
      tooltip: 'Réessayer la connexion au serveur',
      success: 'Connecté au serveur en ligne',
      failed: 'Échec de la connexion au serveur',
      configError: 'Erreur de configuration du serveur',
    },
    demoMode: {
      label: 'MODE DÉMO',
    },
  },
} as const;

i18n.addResourceBundle('en', 'ez-root', locales.en);
i18n.addResourceBundle('fr', 'ez-root', locales.fr);

export type EZRootLocale = typeof locales.en;
