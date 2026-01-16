import i18n from '~i18nConfig';

export const locales = {
  en: {
    backToParameters: 'Back to Parameter Selection',
    sections: {
      emissions: '1. Emissions and Comparisons',
      peopleResponse: '2. People Response',
      legPerformance: '3. Leg Performance',
    },
    editParametersModal: {
      title: 'Edit Parameters',
      content: 'Do you want to keep the current inputs and modify them, or reset all inputs?',
      keepInputs: 'Keep Inputs',
      reset: 'Reset',
      cancel: 'Cancel',
    },
  },
  fr: {
    backToParameters: 'Retour à la sélection des paramètres',
    sections: {
      emissions: '1. Émissions et comparaisons',
      peopleResponse: '2. Réponse des personnes',
      legPerformance: '3. Performance des segments',
    },
    editParametersModal: {
      title: 'Modifier les paramètres',
      content: 'Voulez-vous conserver les entrées actuelles et les modifier, ou réinitialiser toutes les entrées?',
      keepInputs: 'Conserver les entrées',
      reset: 'Réinitialiser',
      cancel: 'Annuler',
    },
  },
} as const;

i18n.addResourceBundle('en', 'ez-output', locales.en);
i18n.addResourceBundle('fr', 'ez-output', locales.fr);

export type EZOutputLocale = typeof locales.en;
