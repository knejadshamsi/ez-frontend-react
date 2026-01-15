import i18n from '~i18nConfig';

export const locales = {
  en: {
    section: {
      title: '1. CONFIGURE EMISSION ZONES',
      addMoreZones: 'Add More Zones',
    },
    addZoneCard: {
      text: 'Add New Zone',
    },
    zoneSettings: {
      hiddenTag: 'This zone is hidden and will be excluded from simulation',
      defaultZoneName: 'Zone {{zoneId}}',
      boundaries: {
        title: 'BOUNDARIES',
        description: 'Geographic boundaries for this emission zone',
        draw: 'Draw zone',
        redraw: 'Redraw zone',
        editTooltip: 'Edit zone boundaries',
      },
      journeys: {
        title: 'JOURNEYS',
        description: 'Include Agents in the simulation',
        startsWithin: 'Starts within',
        passesThrough: 'Passes through',
        endsWithin: 'Ends within',
      },
    },
    vehicleRestrictions: {
      title: 'VEHICLE RESTRICTIONS',
      instructions: 'Double-click to add restrictions for vehicle emission groups. Click icon to edit, drag edges to resize, drag center to move. Click vehicle type name to enable/disable categories globally.',
      vehicleTypes: {
        zeroEmission: 'Zero Em.',
        nearZeroEmission: 'Near-Zero Em.',
        lowEmission: 'Low Em.',
        midEmission: 'Mid Em.',
        highEmission: 'High Em.',
      },
      blockEditor: {
        settings: 'Settings',
        type: 'Type',
        restrict: 'Restrict',
        ban: 'Ban',
        penalty: 'Penalty',
        interval: 'Interval (s)',
      },
    },
  },
  fr: {
    section: {
      title: '1. CONFIGURER LES ZONES D\'ÉMISSION',
      addMoreZones: 'Ajouter des zones',
    },
    addZoneCard: {
      text: 'Nouvelle zone',
    },
    zoneSettings: {
      hiddenTag: 'Cette zone est masquée et sera exclue de la simulation',
      defaultZoneName: 'Zone {{zoneId}}',
      boundaries: {
        title: 'FRONTIÈRES',
        description: 'Frontières géographiques de cette zone d\'émission',
        draw: 'Dessiner la zone',
        redraw: 'Redessiner la zone',
        editTooltip: 'Modifier les frontières de la zone',
      },
      journeys: {
        title: 'TRAJETS',
        description: 'Inclure les agents dans la simulation',
        startsWithin: 'Débute à l\'intérieur',
        passesThrough: 'Traverse',
        endsWithin: 'Se termine à l\'intérieur',
      },
    },
    vehicleRestrictions: {
      title: 'RESTRICTIONS DE VÉHICULES',
      instructions: 'Double-cliquez pour ajouter des restrictions pour les groupes d\'émissions de véhicules. Cliquez sur l\'icône pour modifier, glissez les bords pour redimensionner, glissez le centre pour déplacer. Cliquez sur le nom du type de véhicule pour activer/désactiver les catégories globalement.',
      vehicleTypes: {
        zeroEmission: 'Zéro ém.',
        nearZeroEmission: 'Quasi-zéro ém.',
        lowEmission: 'Faible ém.',
        midEmission: 'Moy. ém.',
        highEmission: 'Haute ém.',
      },
      blockEditor: {
        settings: 'Paramètres',
        type: 'Type',
        restrict: 'Restreindre',
        ban: 'Interdire',
        penalty: 'Pénalité',
        interval: 'Intervalle (s)',
      },
    },
  },
} as const;

i18n.addResourceBundle('en', 'ez-emission-zone-section', locales.en);
i18n.addResourceBundle('fr', 'ez-emission-zone-section', locales.fr);

export type EZEmissionZoneSectionLocale = typeof locales.en;
