import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import {
  EZServiceStore,
  APIPayloadStore,
  APIPayload,
  Zone,
  Coordinate,
  DEFAULT_ZONE_ID
} from './types';
import { useEZSessionStore } from './session';

// ============= DEFAULT VALUE =============
const createInitialPayload = (): APIPayload => ({
  zones: [{
    id: DEFAULT_ZONE_ID,
    coords: null,
    trip: ['start'],
    policies: []
  }]
});

// ============= EZ SERVICE STATE STORE =============
// Manages the current view state

export const useEZServiceStore = create<EZServiceStore>((set) => ({
  state: 'WELCOME',
  isEzBackendAlive: false,
  setState: (value) => set({ state: value }),
  setIsEzBackendAlive: (alive) => set({ isEzBackendAlive: alive }),
  reset: () => set({ state: 'WELCOME', isEzBackendAlive: false }),
}));

// ============= DRAW TOOL STORE =============
// Manages temporary GeoJSON for map polygon drawing

interface DrawToolStore {
  drawToolGeoJson: FeatureCollection<Geometry, GeoJsonProperties>;
  setDrawToolGeoJson: (data: FeatureCollection<Geometry, GeoJsonProperties>) => void;
  reset: () => void;
}

const DEFAULT_GEOJSON: FeatureCollection<Geometry, GeoJsonProperties> = {
  type: 'FeatureCollection',
  features: []
};


export const useDrawToolStore = create<DrawToolStore>((set) => ({
  drawToolGeoJson: DEFAULT_GEOJSON,
  setDrawToolGeoJson: (data) => set({ drawToolGeoJson: data }),
  reset: () => set({ drawToolGeoJson: DEFAULT_GEOJSON }),
}));

// ============= API PAYLOAD STORE =============
// Manages the payload structure for API
export const useAPIPayloadStore = create<APIPayloadStore>((set, get) => ({
  payload: createInitialPayload(),

  addZone: (name: string, color: string): string => {
    const zoneId = uuidv4();

    set((state) => ({
      payload: {
        ...state.payload,
        zones: [...state.payload.zones, {
          id: zoneId,
          coords: null,
          trip: ['start'],
          policies: []
        }]
      }
    }));

    useEZSessionStore.getState().setZoneData(zoneId, {
      name,
      color,
      hidden: false,
      scale: [100, 'center']
    });

    return zoneId;
  },

  removeZone: (zoneId: string) => {
    const state = get();

    if (state.payload.zones.length <= 1) {
      console.warn('[Zone Guard] Cannot delete the last zone. At least one zone must exist.');
      return;
    }

    const deleteIndex = state.payload.zones.findIndex(z => z.id === zoneId);

    const newActiveZoneId = deleteIndex > 0
      ? state.payload.zones[deleteIndex - 1].id
      : state.payload.zones[1].id;

    useEZSessionStore.getState().setActiveZone(newActiveZoneId);

    set((state) => ({
      payload: {
        ...state.payload,
        zones: state.payload.zones.filter(z => z.id !== zoneId)
      }
    }));

    useEZSessionStore.getState().removeZone(zoneId);
  },

  duplicateZone: (zoneId: string) => {
    const state = get();
    const zoneToDuplicate = state.payload.zones.find(z => z.id === zoneId);

    if (!zoneToDuplicate) return;

    const newZoneId = uuidv4();

    const generateDuplicateName = (originalName: string, existingNames: string[]): string => {
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

    set((state) => ({
      payload: {
        ...state.payload,
        zones: [...state.payload.zones, {
          id: newZoneId,
          coords: zoneToDuplicate.coords
            ? zoneToDuplicate.coords.map(polygon =>
                polygon.map(coord => [...coord] as Coordinate)
              )
            : null,
          trip: [...zoneToDuplicate.trip],
          policies: zoneToDuplicate.policies.map(policy => ({
            ...policy,
            period: [...policy.period] as [string, string]
          }))
        }]
      }
    }));

    const sessionStore = useEZSessionStore.getState();
    const sessionData = sessionStore.zones[zoneId];
    if (sessionData) {
      const existingNames = Object.values(sessionStore.zones).map(z => z.name);

      sessionStore.setZoneData(newZoneId, {
        name: generateDuplicateName(sessionData.name, existingNames),
        color: sessionData.color,
        hidden: sessionData.hidden,
        description: sessionData.description,
        scale: [...sessionData.scale] as [number, string] // Deep clone
      });
    }
  },

  updateZone: (zoneId: string, data: Partial<Zone>) => {
    set((state) => ({
      payload: {
        ...state.payload,
        zones: state.payload.zones.map(z =>
          z.id === zoneId ? { ...z, ...data } : z
        )
      }
    }));
  },

  reorderZones: (activeId: string, overId: string) => {
    set((state) => {
      const { zones } = state.payload;
      const activeIndex = zones.findIndex(z => z.id === activeId);
      const overIndex = zones.findIndex(z => z.id === overId);

      if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
        return state;
      }

      const newZones = Array.from(zones);
      const [draggedItem] = newZones.splice(activeIndex, 1);
      newZones.splice(overIndex, 0, draggedItem);

      return {
        payload: {
          ...state.payload,
          zones: newZones
        }
      };
    });
  },

  setZones: (zones: Zone[]) =>
    set((state) => ({
      payload: { ...state.payload, zones }
    })),

  reset: () =>
    set({ payload: createInitialPayload() })
}));
