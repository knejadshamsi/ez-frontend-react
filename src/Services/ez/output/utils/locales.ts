import i18n from '~i18nConfig';

export const locales = {
  en: {
    mapContainer: {
      hideMap: 'Hide Map',
      viewMap: 'View Map',
      retry: 'Retry',
      errorLoading: 'Error loading {{title}}',
    },
  },
  fr: {
    mapContainer: {
      hideMap: 'Masquer la carte',
      viewMap: 'Voir la carte',
      retry: 'Réessayer',
      errorLoading: 'Erreur lors du chargement de {{title}}',
    },
  },
} as const;

i18n.addResourceBundle('en', 'ez-output-utils', locales.en);
i18n.addResourceBundle('fr', 'ez-output-utils', locales.fr);

export type EZOutputUtilsLocale = typeof locales.en;
