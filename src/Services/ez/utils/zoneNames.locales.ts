import i18n from '~i18nConfig';

export const locales = {
  en: {
    newZone: 'New Zone',
    customArea: 'Custom Area',
    newScenario: 'New Scenario',
    copy: 'Copy',
  },
  fr: {
    newZone: 'Nouvelle zone',
    customArea: 'Zone personnalisée',
    newScenario: 'Nouveau scénario',
    copy: 'Copie',
  },
} as const;

i18n.addResourceBundle('en', 'ez-zone-names', locales.en);
i18n.addResourceBundle('fr', 'ez-zone-names', locales.fr);

export type EZZoneNamesLocale = typeof locales.en;
