import i18n from '~i18nConfig';

export const locales = {
  en: {
    section: {
      title: '3. SIMULATION OPTIONS',
    },
    basicSettings: {
      title: 'BASIC SETTINGS',
      description: 'Configure simulation iterations and population coverage',
      iterations: {
        title: 'Simulation Iterations',
        description: 'Higher number can lead to more accurate results at the cost of increased computation time.',
        ariaLabel: 'Simulation iterations slider',
      },
      percentage: {
        title: 'Simulation Percentage',
        description: 'Higher percentage increases resolution at the cost of increased computation time.',
        ariaLabel: 'Simulation percentage slider',
      },
      vehicleDistribution: {
        title: 'Vehicle Distribution',
        description: 'Adjust the distribution of vehicle types among car users. Drag dividers to change percentages.',
        emissionCategories: {
          zeroEmission: 'Zero Em.',
          nearZeroEmission: 'Near-Zero Em.',
          lowEmission: 'Low Em.',
          midEmission: 'Mid Em.',
          highEmission: 'High Em.',
        },
        minCategoryWarning: 'At least one emission category must remain enabled',
      },
    },
    dataSources: {
      title: 'DATA SOURCES',
      description: 'Select datasets for the simulation',
      sourceTypes: {
        population: 'Population',
        network: 'Network',
        publicTransport: 'Public Transportation',
      },
      ariaLabels: {
        yearSelection: '{{sourceType}} year selection',
        sourceSelection: '{{sourceType}} source selection',
      },
    },
    attractiveness: {
      title: 'ATTRACTIVENESS',
      description: 'Left-click for positive values (more attractive), right-click for negative values (less attractive)',
      modes: {
        walk: 'Walk',
        bike: 'Bike',
        ev: 'EV',
        subway: 'Subway',
        bus: 'Bus',
        car: 'Car',
      },
    },
  },
  fr: {
    section: {
      title: '3. OPTIONS DE SIMULATION',
    },
    basicSettings: {
      title: 'PARAMÈTRES DE BASE',
      description: 'Configurer les itérations de simulation et la couverture de population',
      iterations: {
        title: 'Itérations de simulation',
        description: 'Un nombre plus élevé peut donner des résultats plus précis au prix d\'un temps de calcul accru.',
        ariaLabel: 'Curseur d\'itérations de simulation',
      },
      percentage: {
        title: 'Pourcentage de simulation',
        description: 'Un pourcentage plus élevé augmente la résolution au prix d\'un temps de calcul accru.',
        ariaLabel: 'Curseur de pourcentage de simulation',
      },
      vehicleDistribution: {
        title: 'Distribution des véhicules',
        description: 'Ajuster la distribution des types de véhicules parmi les utilisateurs de voitures. Faites glisser les séparateurs pour modifier les pourcentages.',
        emissionCategories: {
          zeroEmission: 'Zéro ém.',
          nearZeroEmission: 'Presque zéro ém.',
          lowEmission: 'Faible ém.',
          midEmission: 'Moy. ém.',
          highEmission: 'Haute ém.',
        },
        minCategoryWarning: 'Au moins une catégorie d\'émissions doit rester activée',
      },
    },
    dataSources: {
      title: 'SOURCES DE DONNÉES',
      description: 'Sélectionner les ensembles de données pour la simulation',
      sourceTypes: {
        population: 'Population',
        network: 'Réseau',
        publicTransport: 'Transport en commun',
      },
      ariaLabels: {
        yearSelection: 'Sélection d\'année {{sourceType}}',
        sourceSelection: 'Sélection de source {{sourceType}}',
      },
    },
    attractiveness: {
      title: 'ATTRACTIVITÉ',
      description: 'Clic gauche pour valeurs positives (plus attrayant), clic droit pour valeurs négatives (moins attrayant)',
      modes: {
        walk: 'Marche',
        bike: 'Vélo',
        ev: 'VÉ',
        subway: 'Métro',
        bus: 'Autobus',
        car: 'Voiture',
      },
    },
  },
} as const;

i18n.addResourceBundle('en', 'ez-simulation-options', locales.en);
i18n.addResourceBundle('fr', 'ez-simulation-options', locales.fr);

export type EZSimulationOptionsLocale = typeof locales.en;
