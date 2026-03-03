import i18n from '~i18nConfig';

export const locales = {
  en: {
    exitModal: {
      exit: 'Exit',
      stayInEZ: 'Stay in EZ',
      copy: 'Copy',
      deleteAndExit: 'Delete & Exit',
      deletingAndCancelling: 'Cancelling & Deleting...',
      deleteSuccess: 'Scenario deleted',
      deleteError: 'Failed to delete scenario',
      saveDraftAndExit: 'Save Draft & Exit',
      savingDraft: 'Saving draft...',
      draftSaved: 'Draft saved: {{draftId}}',
      draftError: 'Failed to save draft',
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
      exit: 'Quitter',
      stayInEZ: 'Rester dans EZ',
      copy: 'Copier',
      deleteAndExit: 'Supprimer et quitter',
      deletingAndCancelling: 'Annulation et suppression...',
      deleteSuccess: 'Scénario supprimé',
      deleteError: 'Échec de la suppression du scénario',
      saveDraftAndExit: 'Sauvegarder brouillon et quitter',
      savingDraft: 'Sauvegarde du brouillon...',
      draftSaved: 'Brouillon sauvegardé: {{draftId}}',
      draftError: 'Échec de la sauvegarde du brouillon',
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
