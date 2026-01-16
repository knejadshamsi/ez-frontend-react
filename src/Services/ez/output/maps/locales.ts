import i18n from '~i18nConfig';

export const locales = {
  en: {
    emissions: {
      title: 'Emissions Map Visualization',
      description: 'Interactive map showing emissions distribution across the network',
      loadingTip: 'Preparing emissions map...',
      controls: {
        visualizationType: 'Visualization Type',
        pollutantType: 'Pollutant Type',
      },
      visualizationTypes: {
        hexagon: 'Hex Layer',
        heatmap: 'Heat Map',
      },
      pollutants: {
        co2: 'CO₂',
        nox: 'NOₓ',
        pm25: 'PM2.5',
        pm10: 'PM10',
      },
    },
    peopleResponse: {
      title: 'People Response Map',
      description: 'Screen grid visualization showing spatial distribution of behavioral responses',
      loadingTip: 'Preparing people response map...',
      controls: {
        viewType: 'View Type',
        responseType: 'Response Type',
      },
      viewTypes: {
        origin: 'Origin',
        destination: 'Destination',
      },
      responseTypes: {
        paidPenalty: 'Paid Penalty',
        rerouted: 'Rerouted',
        switchedToBus: 'Changed to Bus',
        switchedToSubway: 'Changed to Subway',
        switchedToWalking: 'Changed to Walking',
        switchedToBiking: 'Changed to Biking',
        cancelledTrip: 'Trip Cancelled',
      },
    },
    tripLegs: {
      title: 'Trip Leg Visualization',
      description: 'Line layer showing the selected trip route on the network',
      loadingTip: 'Preparing trip legs map...',
      pathsLoaded: '{{count}} paths loaded. Select row from table below to view it on the map.',
      buttons: {
        showAll: 'Show all',
        hideAll: 'Hide all',
      },
    },
  },
  fr: {
    emissions: {
      title: 'Visualisation de la carte des émissions',
      description: 'Carte interactive montrant la distribution des émissions sur le réseau',
      loadingTip: 'Préparation de la carte des émissions...',
      controls: {
        visualizationType: 'Type de visualisation',
        pollutantType: 'Type de polluant',
      },
      visualizationTypes: {
        hexagon: 'Couche hexagonale',
        heatmap: 'Carte de chaleur',
      },
      pollutants: {
        co2: 'CO₂',
        nox: 'NOₓ',
        pm25: 'PM2,5',
        pm10: 'PM10',
      },
    },
    peopleResponse: {
      title: 'Carte de réponse des personnes',
      description: 'Visualisation en grille montrant la distribution spatiale des réponses comportementales',
      loadingTip: 'Préparation de la carte de réponse des personnes...',
      controls: {
        viewType: 'Type de vue',
        responseType: 'Type de réponse',
      },
      viewTypes: {
        origin: 'Origine',
        destination: 'Destination',
      },
      responseTypes: {
        paidPenalty: 'Pénalité payée',
        rerouted: 'Redirigé',
        switchedToBus: 'Changé pour autobus',
        switchedToSubway: 'Changé pour métro',
        switchedToWalking: 'Changé pour marche',
        switchedToBiking: 'Changé pour vélo',
        cancelledTrip: 'Trajet annulé',
      },
    },
    tripLegs: {
      title: 'Visualisation des segments de trajet',
      description: 'Couche de lignes montrant l\'itinéraire du trajet sélectionné sur le réseau',
      loadingTip: 'Préparation de la carte des segments de trajet...',
      pathsLoaded: '{{count}} chemins chargés. Sélectionnez une ligne du tableau ci-dessous pour l\'afficher sur la carte.',
      buttons: {
        showAll: 'Tout afficher',
        hideAll: 'Tout masquer',
      },
    },
  },
} as const;

i18n.addResourceBundle('en', 'ez-output-maps', locales.en);
i18n.addResourceBundle('fr', 'ez-output-maps', locales.fr);

export type EZOutputMapsLocale = typeof locales.en;
