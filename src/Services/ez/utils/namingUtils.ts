import { useAPIPayloadStore } from '~store';
import { useEZSessionStore } from '~stores/session';

// Fetches all names, returns a default name
export const generateDefaultName = (mode: 'zone' | 'customArea'): string => {
  let existingNames: string[];
  let pattern: RegExp;
  let prefix: string;

  if (mode === 'zone') {
    // Get zone names from session store
    const sessionZones = useEZSessionStore.getState().zones;
    existingNames = Object.values(sessionZones).map(zone => zone.name);
    pattern = /^New Zone (\d+)$/;
    prefix = 'New Zone';
  } else {
    // Get custom area names from API payload store
    const customAreas = useAPIPayloadStore.getState().payload.customSimulationAreas;
    existingNames = customAreas.map(area => area.name);
    pattern = /^Custom Area (\d+)$/;
    prefix = 'Custom Area';
  }

  // Extract numbers from names that match the pattern
  const numbers = existingNames
    .map(name => {
      const match = name.match(pattern);
      return match ? match[1] : undefined;
    })
    .filter(num => num !== undefined)
    .map(num => parseInt(num as string, 10))
    .filter(num => num >= 1); // Only positive numbers (>= 1)

  // Find the lowest unoccupied number starting from 1
  const occupiedSet = new Set(numbers);
  let candidate = 1;
  while (occupiedSet.has(candidate)) {
    candidate++;
  }

  return `${prefix} ${candidate}`;
};

// reutrns a duplicate name by appending "(Copy)" or "(Copy) N" suffix
export const generateDuplicateName = (originalName: string, existingNames: string[]): string => {
  const copyPattern = /\s*\(Copy\)(\s+\d+)?$/;
  const baseName = originalName.replace(copyPattern, '');

  let candidateName = `${baseName} (Copy)`;
  if (!existingNames.includes(candidateName)) {
    return candidateName;
  }

  let counter = 2;
  while (existingNames.includes(`${baseName} (Copy) ${counter}`)) {
    counter++;
  }

  return `${baseName} (Copy) ${counter}`;
};
