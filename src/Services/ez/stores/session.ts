import { create } from 'zustand';
import { DEFAULT_ZONE_ID } from './types';

export interface ZoneSessionData {
  name: string;
  color: string;
  hidden: boolean;
  description?: string;
  scale: [number, string];
}

export interface EZSessionStore {
  scenarioTitle: string;
  scenarioDescription: string;
  requestId: string;
  zones: { [zoneId: string]: ZoneSessionData };

  activeZone: string | null;
  colorPalette: string[];

  setScenarioTitle: (title: string) => void;
  setScenarioDescription: (description: string) => void;
  setRequestId: (id: string) => void;
  setZoneProperty: (zoneId: string, property: keyof ZoneSessionData, value: any) => void;
  setZoneData: (zoneId: string, data: Partial<ZoneSessionData>) => void;
  removeZone: (zoneId: string) => void;
  setActiveZone: (zoneId: string | null) => void;
  nextAvailableColor: () => string;

  reset: () => void;
}

// ============= DEFAULT VALUES =============
const DEFAULT_SCENARIO_TITLE = 'New Scenario';
const DEFAULT_SCENARIO_DESCRIPTION = '';
const DEFAULT_REQUEST_ID = '';
const COLOR_PALETTE = [
  '#1A16E2',
  '#003366',
  '#5F0F40',
  '#7209B7',
  '#FA3E9A',
  '#FF6B6B',
  '#FF2800',
  '#FF7E00'
];
const DEFAULT_ZONE_SESSION_DATA: ZoneSessionData = {
  name: 'New Zone 1',
  color: COLOR_PALETTE[0],
  hidden: false,
  scale: [100, 'center']
};

const createInitialState = () => ({
  scenarioTitle: DEFAULT_SCENARIO_TITLE,
  scenarioDescription: DEFAULT_SCENARIO_DESCRIPTION,
  requestId: DEFAULT_REQUEST_ID,
  zones: {
    [DEFAULT_ZONE_ID]: DEFAULT_ZONE_SESSION_DATA
  },
  activeZone: DEFAULT_ZONE_ID,
  colorPalette: [...COLOR_PALETTE],
});

export const useEZSessionStore = create<EZSessionStore>((set, get) => ({
  ...createInitialState(),

  setScenarioTitle: (scenarioTitle: string) =>
    set({ scenarioTitle: scenarioTitle.slice(0, 50) }),

  setScenarioDescription: (scenarioDescription: string) =>
    set({ scenarioDescription }),

  setRequestId: (requestId: string) =>
    set({ requestId }),

  setZoneProperty: (zoneId: string, property: keyof ZoneSessionData, value: any) =>
    set((state) => ({
      zones: {
        ...state.zones,
        [zoneId]: {
          ...state.zones[zoneId],
          [property]: value
        }
      }
    })),

  setZoneData: (zoneId: string, data: Partial<ZoneSessionData>) =>
    set((state) => ({
      zones: {
        ...state.zones,
        [zoneId]: {
          ...state.zones[zoneId],
          ...data
        }
      }
    })),

  removeZone: (zoneId: string) =>
    set((state) => {
      const newZones = { ...state.zones };
      delete newZones[zoneId];
      return { zones: newZones };
    }),

  setActiveZone: (activeZone: string | null) =>
    set({ activeZone }),

  nextAvailableColor: () => {
    const state = get();
    const randomIndex = Math.floor(Math.random() * state.colorPalette.length);
    return state.colorPalette[randomIndex];
  },

  reset: () => {
    set(createInitialState());
  },
}));

