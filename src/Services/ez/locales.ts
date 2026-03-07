import i18n from '~i18nConfig';

export const locales = {
  en: {
    exitWarnings: {
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
        message: 'The simulation is currently running. You can exit and your scenario will be saved, or delete it permanently.',
      },
      sessionWillBeLost: {
        title: 'Exit Simulation',
        message: 'Your scenario and results are saved. You can exit safely or delete the scenario permanently.',
      },
      confirmExit: {
        title: 'Exit',
        message: 'Are you sure you want to exit?',
      },
      offlineDataLost: {
        title: 'Backend Offline',
        message: 'The backend is currently offline. Your configuration cannot be saved and will be lost.',
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
    errors: {
      timeout: 'Data not received within timeout period',
    },
    demoMode: {
      label: 'DEMO MODE',
      scenarioTitle: 'Demo Scenario',
    },
    parameterSelection: {
      backToWelcome: 'Back to Welcome page',
      newScenario: 'New Scenario',
      startSimulation: 'Start Simulation',
      cancel: 'Cancel',
      editTitle: 'Edit scenario title',
      saveTitle: 'Save scenario title',
      simulationFailed: 'Simulation failed',
      backToWelcomeWarning: {
        title: 'Return to Welcome?',
        both: 'All configuration and simulation results will be lost. This action cannot be undone.',
        inputOnly: 'All configuration will be lost. This action cannot be undone.',
        confirm: 'Yes, Return to Welcome',
      },
      validation: {
        noZones: 'At least one emission zone with coordinates must be selected.',
        invalidZones: 'All zones must have valid coordinates.',
        carDistributionTotal: 'Vehicle distribution must sum to 100%.',
        noCategories: 'At least one emission category must be enabled.',
        invalidIterations: 'Simulation iterations must be between 1 and 10.',
        invalidPercentage: 'Simulation percentage must be between 1 and 10.',
      },
    },
  },
  fr: {
    exitWarnings: {
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
        message: 'La simulation est en cours d\'exécution. Vous pouvez quitter et votre scénario sera sauvegardé, ou le supprimer définitivement.',
      },
      sessionWillBeLost: {
        title: 'Quitter la simulation',
        message: 'Votre scénario et vos résultats sont sauvegardés. Vous pouvez quitter en toute sécurité ou supprimer le scénario définitivement.',
      },
      confirmExit: {
        title: 'Quitter',
        message: 'Êtes-vous sûr de vouloir quitter?',
      },
      offlineDataLost: {
        title: 'Serveur hors ligne',
        message: 'Le serveur est actuellement hors ligne. Votre configuration ne peut pas être sauvegardée et sera perdue.',
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
    errors: {
      timeout: 'Données non reçues dans le délai imparti',
    },
    demoMode: {
      label: 'MODE DÉMO',
      scenarioTitle: 'Scenario de demonstration',
    },
    parameterSelection: {
      backToWelcome: 'Retour à la page d\'accueil',
      newScenario: 'Nouveau scénario',
      startSimulation: 'Lancer la simulation',
      cancel: 'Annuler',
      editTitle: 'Modifier le titre du scénario',
      saveTitle: 'Enregistrer le titre du scénario',
      simulationFailed: 'Échec de la simulation',
      backToWelcomeWarning: {
        title: 'Retourner à l\'accueil?',
        both: 'Toute la configuration et les résultats de simulation seront perdus. Cette action est irréversible.',
        inputOnly: 'Toute la configuration sera perdue. Cette action est irréversible.',
        confirm: 'Oui, retourner à l\'accueil',
      },
      validation: {
        noZones: 'Au moins une zone d\'émission avec des coordonnées doit être sélectionnée.',
        invalidZones: 'Toutes les zones doivent avoir des coordonnées valides.',
        carDistributionTotal: 'La distribution des véhicules doit totaliser 100%.',
        noCategories: 'Au moins une catégorie d\'émission doit être activée.',
        invalidIterations: 'Le nombre d\'itérations doit être entre 1 et 10.',
        invalidPercentage: 'Le pourcentage de simulation doit être entre 1 et 10.',
      },
    },
  },
} as const;

i18n.addResourceBundle('en', 'ez-root', locales.en);
i18n.addResourceBundle('fr', 'ez-root', locales.fr);