import i18n from '~i18nConfig';

export const locales = {
  en: {
    section: {
      title: '2. SELECT SIMULATION AREA',
    },
    zoneScaling: {
      title: 'ZONE SCALING',
      description: 'Scale emission zone to include the surrounding area',
      emptyState: 'Please select at least one emission zone first',
      origins: {
        center: 'Center',
        topLeft: 'Top Left',
        topRight: 'Top Right',
        bottomLeft: 'Bottom Left',
        bottomRight: 'Bottom Right',
      },
    },
    customAreas: {
      title: 'CUSTOM AREAS',
      description: 'Include other areas',
      emptyState: 'No custom areas added yet',
      addButton: 'Add Custom Area',
      addAnotherButton: 'Add Another Area',
      colorPresetLabel: 'Recommended',
      editTooltip: 'Edit area boundaries',
      drawFirstTooltip: 'Draw area first',
      changeColorTooltip: 'Change color',
      deleteTooltip: 'Delete area',
    },
    displayControls: {
      borderLabel: 'Border: {{style}}',
      fillLabel: 'Fill: {{style}}',
      borderStyles: {
        solid: 'Solid',
        dashed: 'Dashed',
        dotted: 'Dotted',
      },
      fillStyles: {
        transparent: 'Transparent',
        lightlyColored: 'Lightly Colored',
        colored: 'Colored',
      },
    },
  },
  fr: {
    section: {
      title: '2. SÉLECTIONNER LA ZONE DE SIMULATION',
    },
    zoneScaling: {
      title: 'MISE À L\'ÉCHELLE DE ZONE',
      description: 'Agrandir la zone d\'émission pour inclure les environs',
      emptyState: 'Veuillez d\'abord sélectionner au moins une zone d\'émission',
      origins: {
        center: 'Centre',
        topLeft: 'Haut gauche',
        topRight: 'Haut droit',
        bottomLeft: 'Bas gauche',
        bottomRight: 'Bas droit',
      },
    },
    customAreas: {
      title: 'ZONES PERSONNALISÉES',
      description: 'Inclure d\'autres zones',
      emptyState: 'Aucune zone personnalisée ajoutée',
      addButton: 'Ajouter une zone personnalisée',
      addAnotherButton: 'Ajouter une autre zone',
      colorPresetLabel: 'Recommandé',
      editTooltip: 'Modifier les frontières de la zone',
      drawFirstTooltip: 'Dessiner la zone d\'abord',
      changeColorTooltip: 'Changer la couleur',
      deleteTooltip: 'Supprimer la zone',
    },
    displayControls: {
      borderLabel: 'Bordure: {{style}}',
      fillLabel: 'Remplissage: {{style}}',
      borderStyles: {
        solid: 'Pleine',
        dashed: 'Tirets',
        dotted: 'Pointillés',
      },
      fillStyles: {
        transparent: 'Transparent',
        lightlyColored: 'Légèrement coloré',
        colored: 'Coloré',
      },
    },
  },
} as const;

i18n.addResourceBundle('en', 'ez-simulation-area-section', locales.en);
i18n.addResourceBundle('fr', 'ez-simulation-area-section', locales.fr);

export type EZSimulationAreaSectionLocale = typeof locales.en;
