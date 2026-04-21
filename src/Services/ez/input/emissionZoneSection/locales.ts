import i18n from '~i18nConfig';

const locales = {
  en: {
    section: {
      title: '1. CONFIGURE EMISSION ZONES',
      addMoreZones: 'Add More Zones',
      scrollLeft: 'Scroll zones left',
      scrollRight: 'Scroll zones right',
    },
    addZoneCard: {
      text: 'Add New Zone',
    },
    zoneSettings: {
      hiddenTag: 'This zone is hidden and will be excluded from simulation',
      defaultZoneName: 'Zone {{zoneId}}',
      zoneCard: {
        showZone: 'Show zone',
        hideZone: 'Hide zone',
        duplicateZone: 'Duplicate zone',
        changeColor: 'Change color',
        deleteZone: 'Delete zone',
        dragToReorder: 'Drag to reorder zone',
        colorSwatch: 'Zone color swatch',
      },
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
      columnHeader: 'Vehicle Type',
      blockEditor: {
        settings: 'Settings',
        type: 'Type',
        restrict: 'Restrict',
        ban: 'Ban',
        penalty: 'Penalty',
        interval: 'Interval (s)',
        delete: 'Delete restriction',
        penaltyFormat: '{{currency}}{{penalty}}/{{interval}}s',
      },
      a11y: {
        restrictionBlock: '{{type}} restriction from {{start}} to {{end}}',
        toggleVehicle: 'Toggle {{vehicle}} category',
        selectVehicle: 'Select {{vehicle}}',
      },
    },
  },
  fr: {
    section: {
      title: '1. CONFIGURER LES ZONES D\'ÉMISSION',
      addMoreZones: 'Ajouter des zones',
      scrollLeft: 'Défiler les zones à gauche',
      scrollRight: 'Défiler les zones à droite',
    },
    addZoneCard: {
      text: 'Nouvelle zone',
    },
    zoneSettings: {
      hiddenTag: 'Cette zone est masquée et sera exclue de la simulation',
      defaultZoneName: 'Zone {{zoneId}}',
      zoneCard: {
        showZone: 'Afficher la zone',
        hideZone: 'Masquer la zone',
        duplicateZone: 'Dupliquer la zone',
        changeColor: 'Changer la couleur',
        deleteZone: 'Supprimer la zone',
        dragToReorder: 'Glisser pour réordonner la zone',
        colorSwatch: 'Échantillon de couleur de zone',
      },
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
      columnHeader: 'Type de vehicule',
      blockEditor: {
        settings: 'Paramètres',
        type: 'Type',
        restrict: 'Restreindre',
        ban: 'Interdire',
        penalty: 'Pénalité',
        interval: 'Intervalle (s)',
        delete: 'Supprimer la restriction',
        penaltyFormat: '{{penalty}}{{currency}}/{{interval}}s',
      },
      a11y: {
        restrictionBlock: 'Restriction {{type}} de {{start}} a {{end}}',
        toggleVehicle: 'Activer/desactiver la categorie {{vehicle}}',
        selectVehicle: 'Selectionner {{vehicle}}',
      },
    },
  },
} as const;

i18n.addResourceBundle('en', 'ez-emission-zone-section', locales.en);
i18n.addResourceBundle('fr', 'ez-emission-zone-section', locales.fr);
