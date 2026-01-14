import i18n from '~i18nConfig';

export const locales = {
  en: {
    layerVisibility: {
      showAll: 'Show All',
    },
    scaledAreaSuffix: '% scaled',
    instructions: {
      drawMode: 'Click to place points. Complete the polygon or double click to save.',
      editMode: 'Drag vertices to move them. Click and drag on polygon lines to add new vertices. Right-click vertices to remove them.',
    },
    buttons: {
      cancel: 'Cancel',
      done: 'Done',
    },
    sections: {
      previousPolygons: 'Previous Polygons',
      emissionZones: 'EMISSION ZONES',
      simulationAreas: 'SIMULATION AREAS',
    },
    errors: {
      invalidPolygonData: 'Invalid polygon data',
    },
    fallbacks: {
      unknownZone: 'Unknown',
    },
  },
  fr: {
    layerVisibility: {
      showAll: 'Tout afficher',
    },
    scaledAreaSuffix: '% agrandi',
    instructions: {
      drawMode: 'Cliquez pour placer des points. Complétez le polygone ou double-cliquez pour sauvegarder.',
      editMode: 'Glissez les sommets pour les déplacer. Cliquez et glissez sur les lignes pour ajouter de nouveaux sommets. Clic droit sur un sommet pour le supprimer.',
    },
    buttons: {
      cancel: 'Annuler',
      done: 'Terminé',
    },
    sections: {
      previousPolygons: 'Polygones précédents',
      emissionZones: 'ZONES D\'ÉMISSION',
      simulationAreas: 'ZONES DE SIMULATION',
    },
    errors: {
      invalidPolygonData: 'Données de polygone invalides',
    },
    fallbacks: {
      unknownZone: 'Inconnu',
    },
  },
} as const;

i18n.addResourceBundle('en', 'ez-drawing-controls', locales.en);
i18n.addResourceBundle('fr', 'ez-drawing-controls', locales.fr);

export type EZDrawingControlsLocale = typeof locales.en;
