import { useEZSessionStore } from '~stores/session';
import i18n from '~i18nConfig';
import './zoneNames.locales';

type DefaultNameType = 'zone' | 'customArea' | 'scenario' | null;

interface DetectedDefaultName {
  type: DefaultNameType;
  number: number;
  hasCopy: boolean;
  copyNumber?: number; // undefined for "(Copy)", number for "(Copy) 2", "(Copy) 3", etc.
}

// Patterns for both languages
const PATTERNS = {
  zone: {
    en: /^New Zone (\d+)$/,
    fr: /^Nouvelle zone (\d+)$/,
  },
  customArea: {
    en: /^Custom Area (\d+)$/,
    fr: /^Zone personnalisée (\d+)$/,
  },
  scenario: {
    en: /^New Scenario$/,
    fr: /^Nouveau scénario$/,
  },
};

// Detect if a name matches a default pattern in any language
export const detectDefaultNameType = (name: string): DetectedDefaultName => {
  // Check for (Copy) suffix in either language
  const copyPatternEn = /\s*\(Copy\)(\s+(\d+))?$/;
  const copyPatternFr = /\s*\(Copie\)(\s+(\d+))?$/;

  let hasCopy = false;
  let copyNumber: number | undefined = undefined;
  let nameWithoutCopy = name;

  // Remove (Copy) suffix if present
  const copyMatchEn = name.match(copyPatternEn);
  const copyMatchFr = name.match(copyPatternFr);

  if (copyMatchEn) {
    hasCopy = true;
    copyNumber = copyMatchEn[2] ? parseInt(copyMatchEn[2], 10) : undefined;
    nameWithoutCopy = name.replace(copyPatternEn, '');
  } else if (copyMatchFr) {
    hasCopy = true;
    copyNumber = copyMatchFr[2] ? parseInt(copyMatchFr[2], 10) : undefined;
    nameWithoutCopy = name.replace(copyPatternFr, '');
  }

  // Try zone patterns
  for (const lang of ['en', 'fr'] as const) {
    const match = nameWithoutCopy.match(PATTERNS.zone[lang]);
    if (match) {
      return { type: 'zone', number: parseInt(match[1], 10), hasCopy, copyNumber };
    }
  }

  // Try custom area patterns
  for (const lang of ['en', 'fr'] as const) {
    const match = nameWithoutCopy.match(PATTERNS.customArea[lang]);
    if (match) {
      return { type: 'customArea', number: parseInt(match[1], 10), hasCopy, copyNumber };
    }
  }

  // Try scenario patterns (no number in scenario names)
  for (const lang of ['en', 'fr'] as const) {
    const match = nameWithoutCopy.match(PATTERNS.scenario[lang]);
    if (match) {
      return { type: 'scenario', number: 0, hasCopy, copyNumber };
    }
  }

  return { type: null, number: 0, hasCopy: false };
};

// Convert a default name to a specific language
export const convertDefaultName = (name: string, toLang: 'en' | 'fr'): string => {
  const detected = detectDefaultNameType(name);

  if (detected.type === null) {
    return name; // Not a default name, return as-is
  }

  const t = i18n.getFixedT(toLang, 'ez-zone-names');

  let baseName: string;

  if (detected.type === 'scenario') {
    baseName = t('newScenario'); // Scenarios don't have numbers
  } else {
    const prefix = detected.type === 'zone' ? t('newZone') : t('customArea');
    baseName = `${prefix} ${detected.number}`;
  }

  // Add (Copy) suffix if present in original
  if (detected.hasCopy) {
    const copyText = t('copy');
    if (detected.copyNumber === undefined) {
      return `${baseName} (${copyText})`;
    } else {
      return `${baseName} (${copyText}) ${detected.copyNumber}`;
    }
  }

  return baseName;
};

export const generateDefaultName = (mode: 'zone' | 'customArea'): string => {
  let existingNames: string[];
  const t = i18n.t.bind(i18n);

  switch (mode) {
    case 'zone':
      const sessionZones = useEZSessionStore.getState().zones;
      existingNames = Object.values(sessionZones).map(zone => zone.name);
      break;
    case 'customArea':
      const sessionCustomAreas = useEZSessionStore.getState().customAreas;
      existingNames = Object.values(sessionCustomAreas).map(area => area.name);
      break;
  }

  // Extract numbers from existing default names in ANY language
  const numbers = existingNames
    .map(name => {
      const detected = detectDefaultNameType(name);
      return detected.type === mode ? detected.number : undefined;
    })
    .filter((num): num is number => num !== undefined && num >= 1);

  const occupiedSet = new Set(numbers);
  let candidate = 1;
  while (occupiedSet.has(candidate)) {
    candidate++;
  }

  const prefix = mode === 'zone' ? t('ez-zone-names:newZone') : t('ez-zone-names:customArea');
  return `${prefix} ${candidate}`;
};

export const generateDuplicateName = (originalName: string, existingNames: string[]): string => {
  const t = i18n.t.bind(i18n);
  const copyText = t('ez-zone-names:copy');

  // Patterns for both languages
  const copyPatternEn = /\s*\(Copy\)(\s+\d+)?$/;
  const copyPatternFr = /\s*\(Copie\)(\s+\d+)?$/;

  // Remove copy suffix in any language
  let baseName = originalName.replace(copyPatternEn, '').replace(copyPatternFr, '');

  let candidateName = `${baseName} (${copyText})`;
  if (!existingNames.includes(candidateName)) {
    return candidateName;
  }

  let counter = 2;
  while (existingNames.includes(`${baseName} (${copyText}) ${counter}`)) {
    counter++;
  }

  return `${baseName} (${copyText}) ${counter}`;
};
