import i18n from '~i18nConfig';

export const locales = {
  en: {
    welcome: {
      title: 'Welcome to ',
      titleBold: 'Emission Zone Impact analysis Tool',
      titleEnd: '.',
      subtitle: 'Create emission zones with time-based vehicle restrictions, configure and run agent-based simulations, and analyze policy impacts on emissions, air quality, transportation patterns, and fleet composition with spatial and trip-level insights.',
    },
    previousScenarios: {
      title: 'Previous Scenarios',
      viewButton: 'View Scenario',
    },
    input: {
      placeholder: 'Enter request ID or draft ID',
    },
    buttons: {
      viewPrevious: 'View Previous Scenario',
      createNew: 'Create your own scenario',
    },
    errors: {
      loadFailed: 'Failed to load scenario. Try again',
      invalidId: 'Invalid scenario ID',
      enterValidId: 'Please enter a valid scenario ID',
      scenarioDeleted: 'This scenario has been deleted',
      draftLoadFailed: 'Failed to load draft',
    },
    status: {
      cancelled: 'cancelled',
      failed: 'failed',
    },
    nonCompleted: {
      title: 'Scenario not completed',
      content: 'This scenario was {{status}}. Would you like to view the inputs and try again?',
      okText: 'View inputs',
      cancelText: 'Back to welcome',
    },
    scenarios: {
      SC001: {
        name: 'Downtown Montreal LEZ',
        description: 'Low emission zone analysis for downtown Montreal area',
      },
      SC002: {
        name: 'Old Port ZEZ',
        description: 'Zero emission zone impact study for Old Port district',
      },
    },
  },
  fr: {
    welcome: {
      title: 'Bienvenue à l\'',
      titleBold: 'outil d\'analyse d\'impact des zones d\'émission',
      titleEnd: '.',
      subtitle: 'Créez des zones d\'émission avec restrictions horaires de véhicules, configurez et exécutez des simulations multi-agents, et analysez les impacts des politiques sur les émissions, la qualité de l\'air, les habitudes de transport et la composition de la flotte avec des analyses spatiales et au niveau des trajets.',
    },
    previousScenarios: {
      title: 'Scénarios précédents',
      viewButton: 'Voir le scénario',
    },
    input: {
      placeholder: 'Entrez un identifiant de requête ou de brouillon',
    },
    buttons: {
      viewPrevious: 'Voir le scénario précédent',
      createNew: 'Créer votre propre scénario',
    },
    errors: {
      loadFailed: 'Échec du chargement du scénario. Réessayez',
      invalidId: 'Identifiant de scénario invalide',
      enterValidId: 'Veuillez entrer un identifiant de scénario valide',
      scenarioDeleted: 'Ce scénario a été supprimé',
      draftLoadFailed: 'Échec du chargement du brouillon',
    },
    status: {
      cancelled: 'annulé',
      failed: 'échoué',
    },
    nonCompleted: {
      title: 'Scénario non complété',
      content: 'Ce scénario a été {{status}}. Voulez-vous voir les paramètres et réessayer?',
      okText: 'Voir les paramètres',
      cancelText: 'Retour à l\'accueil',
    },
    scenarios: {
      SC001: {
        name: 'ZFE du centre-ville de Montréal',
        description: 'Analyse de zone à faibles émissions pour le centre-ville de Montréal',
      },
      SC002: {
        name: 'ZZE du Vieux-Port',
        description: 'Étude d\'impact de zone à émissions nulles pour le district du Vieux-Port',
      },
    },
  },
} as const;

// Register with i18next
i18n.addResourceBundle('en', 'ez-welcome', locales.en);
i18n.addResourceBundle('fr', 'ez-welcome', locales.fr);

export type EZWelcomeLocale = typeof locales.en;
