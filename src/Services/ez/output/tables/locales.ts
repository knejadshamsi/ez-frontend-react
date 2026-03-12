import i18n from '~i18nConfig';

const locales = {
  en: {
    tripLegsTable: {
      loadingTip: 'Loading trip legs data...',
      error: 'Error loading trip legs page',
      retry: 'Retry',
      noData: 'No trip leg data available',
      description: 'Individual trip legs showing the impact on emissions and travel time. Select rows to display trips on the map.',
      columns: {
        personId: 'Person',
        originActivity: 'From',
        destinationActivity: 'To',
        co2DeltaGrams: 'CO2 Delta',
        timeDeltaMinutes: 'Time Delta',
        impact: 'Impact',
      },
      ncToggleLabel: 'Include unchanged',
      selectAll: 'Select all',
      deselectAll: 'Deselect all',
      viewModes: {
        hideMap: 'Hide Map',
        showMap: 'Show Map',
      },
    },
  },
  fr: {
    tripLegsTable: {
      loadingTip: 'Chargement des donnees des segments de trajet...',
      error: 'Erreur lors du chargement de la page des segments de trajet',
      retry: 'Reessayer',
      noData: 'Aucune donnee de segment de trajet disponible',
      description: 'Segments de trajet individuels montrant l\'impact sur les emissions et le temps de trajet. Selectionnez des lignes pour afficher les deplacements sur la carte.',
      columns: {
        personId: 'Personne',
        originActivity: 'De',
        destinationActivity: 'Vers',
        co2DeltaGrams: 'Delta CO2',
        timeDeltaMinutes: 'Delta temps',
        impact: 'Impact',
      },
      ncToggleLabel: 'Inclure inchanges',
      selectAll: 'Tout selectionner',
      deselectAll: 'Tout deselectionner',
      viewModes: {
        hideMap: 'Masquer la carte',
        showMap: 'Afficher la carte',
      },
    },
  },
} as const;

i18n.addResourceBundle('en', 'ez-output-tables', locales.en);
i18n.addResourceBundle('fr', 'ez-output-tables', locales.fr);
