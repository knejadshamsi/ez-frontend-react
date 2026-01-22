import i18n from '~i18nConfig';

export const locales = {
  en: {
    exitModal: {
      exitAnyway: 'Exit Anyway',
      exitWithoutSaving: 'Exit Without Saving',
      stayInEZ: 'Stay in EZ',
      copy: 'Copy',
      saveAndExit: 'Save & Exit',
      saving: 'Saving changes...',
      saveSuccess: 'Changes saved successfully',
      saveError: 'Failed to save changes',
    },
    copyRequestId: {
      noIdAvailable: 'No request ID available to copy',
      copiedSuccess: 'Request ID copied to clipboard',
      copyFailed: 'Failed to copy request ID. Please try again or copy manually.',
      copying: 'Copying...',
      copied: 'Copied!',
      copyId: 'Copy ID',
      tooltipCopyId: 'Copy Request ID',
    },
    inlineNameEditor: {
      placeholder: 'Enter name',
      errorEmpty: 'Name cannot be empty',
      tooltipSave: 'Save',
      tooltipCancel: 'Cancel',
      tooltipEdit: 'Edit name',
    },
  },
  fr: {
    exitModal: {
      exitAnyway: 'Quitter quand même',
      exitWithoutSaving: 'Quitter sans sauvegarder',
      stayInEZ: 'Rester dans EZ',
      copy: 'Copier',
      saveAndExit: 'Sauvegarder et quitter',
      saving: 'Sauvegarde en cours...',
      saveSuccess: 'Modifications sauvegardées avec succès',
      saveError: 'Échec de la sauvegarde des modifications',
    },
    copyRequestId: {
      noIdAvailable: 'Aucun ID de requête disponible à copier',
      copiedSuccess: 'ID de requête copié dans le presse-papiers',
      copyFailed: 'Échec de la copie de l\'ID de requête. Veuillez réessayer ou copier manuellement.',
      copying: 'Copie en cours...',
      copied: 'Copié!',
      copyId: 'Copier ID',
      tooltipCopyId: 'Copier l\'ID de requête',
    },
    inlineNameEditor: {
      placeholder: 'Entrez un nom',
      errorEmpty: 'Le nom ne peut pas être vide',
      tooltipSave: 'Enregistrer',
      tooltipCancel: 'Annuler',
      tooltipEdit: 'Modifier le nom',
    },
  },
} as const;

i18n.addResourceBundle('en', 'ez-components', locales.en);
i18n.addResourceBundle('fr', 'ez-components', locales.fr);

export type EZComponentsLocale = typeof locales.en;
