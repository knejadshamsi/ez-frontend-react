import i18n from '~i18nConfig';

export const locales = {
  en: {
    tripLegsTable: {
      loadingTip: 'Loading trip legs data...',
      error: 'Error loading trip legs page',
      retry: 'Retry',
      description: 'All individual trip legs showing the granular impact on emissions and travel time. Click column headers to sort or click a row to toggle visibility on map.',
      columns: {
        personId: 'Person ID',
        originActivity: 'From Activity',
        destinationActivity: 'To Activity',
        co2DeltaGrams: 'CO₂ Δ (g)',
        timeDeltaMinutes: 'Time Δ (min)',
        impact: 'Impact',
      },
    },
  },
  fr: {
    tripLegsTable: {
      loadingTip: 'Chargement des données des segments de trajet...',
      error: 'Erreur lors du chargement de la page des segments de trajet',
      retry: 'Réessayer',
      description: 'Tous les segments de trajet individuels montrant l\'impact granulaire sur les émissions et le temps de trajet. Cliquez sur les en-têtes de colonnes pour trier ou cliquez sur une rangée pour basculer la visibilité sur la carte.',
      columns: {
        personId: 'ID personne',
        originActivity: 'Activité d\'origine',
        destinationActivity: 'Activité de destination',
        co2DeltaGrams: 'Δ CO₂ (g)',
        timeDeltaMinutes: 'Δ temps (min)',
        impact: 'Impact',
      },
    },
  },
} as const;

i18n.addResourceBundle('en', 'ez-output-tables', locales.en);
i18n.addResourceBundle('fr', 'ez-output-tables', locales.fr);

export type EZOutputTablesLocale = typeof locales.en;
