import i18n from '~i18nConfig';

const locales = {
  en: {
    mapContainer: {
      hideMap: 'Hide Map',
      viewMap: 'View Map',
      retry: 'Retry',
      errorLoading: 'Error loading {{title}}',
      hideMapAriaLabel: 'Hide Map - {{title}}',
      viewMapAriaLabel: 'View Map - {{title}}',
      retryAriaLabel: 'Retry - {{title}}',
    },
  },
  fr: {
    mapContainer: {
      hideMap: 'Masquer la carte',
      viewMap: 'Voir la carte',
      retry: 'Réessayer',
      errorLoading: 'Erreur lors du chargement de {{title}}',
      hideMapAriaLabel: 'Masquer la carte - {{title}}',
      viewMapAriaLabel: 'Voir la carte - {{title}}',
      retryAriaLabel: 'Réessayer - {{title}}',
    },
  },
} as const;

i18n.addResourceBundle('en', 'ez-output-utils', locales.en);
i18n.addResourceBundle('fr', 'ez-output-utils', locales.fr);

type EZOutputUtilsLocale = typeof locales.en;
