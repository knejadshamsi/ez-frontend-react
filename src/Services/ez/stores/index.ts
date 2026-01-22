import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { FeatureCollection } from '@deck.gl-community/editable-layers';
import {
  EZServiceStore,
  APIPayloadStore,
  APIPayload,
  Zone,
  Coordinate,
  Sources,
  SimulationOptions,
  CarDistribution,
  ModeUtilities,
  CustomSimulationArea,
  ScaledSimulationArea,
  DEFAULT_ZONE_ID
} from './types';
import { useEZSessionStore } from './session';
import { generateDefaultName, generateDuplicateName } from '~utils/zoneNames';

// ============= DEFAULT VALUE =============
export const createInitialPayload = (): APIPayload => ({
  zones: [{
    id: DEFAULT_ZONE_ID,
    coords: null,
    trip: ['start'],
    policies: []
  }],
  customSimulationAreas: [],
  scaledSimulationAreas: [],
  sources: {
    population: {
      year: 2024,
      name: 'montreal-polytechnique-pipeline-2024'
    },
    network: {
      year: 2025,
      name: 'osm-2025'
    },
    publicTransport: {
      year: 2024,
      name: 'stm-gtfs-2024'
    }
  },
  simulationOptions: {
    iterations: 5,
    percentage: 5
  },
  carDistribution: {
    zeroEmission: 30,
    nearZeroEmission: 35,
    lowEmission: 35,
    midEmission: 0,
    highEmission: 0
  },
  modeUtilities: {
    walk: 0,
    bike: 0,
    car: 0,
    ev: 0,
    subway: 0,
    bus: 0
  }
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
  drawToolGeoJson: FeatureCollection;
  setDrawToolGeoJson: (data: FeatureCollection) => void;
  reset: () => void;
}

const DEFAULT_GEOJSON: FeatureCollection = {
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

  addZone: (color: string): string => {
    const zoneId = uuidv4();
    const name = generateDefaultName('zone');

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
      console.warn('Cannot delete the last zone. At least one zone must exist.');
      return;
    }

    const deleteIndex = state.payload.zones.findIndex(z => z.id === zoneId);

    const newActiveZoneId = deleteIndex > 0
      ? state.payload.zones[deleteIndex - 1].id
      : state.payload.zones[1].id;

    useEZSessionStore.getState().setActiveZone(newActiveZoneId);

    // Remove zone from payload
    set((state) => ({
      payload: {
        ...state.payload,
        zones: state.payload.zones.filter(z => z.id !== zoneId)
      }
    }));

    // Remove zone from session
    useEZSessionStore.getState().removeZone(zoneId);

    // CASCADE DELETE: Remove all scaled areas that reference this zone
    const scaledAreasToRemove = state.payload.scaledSimulationAreas
      .filter(area => area.zoneId === zoneId);

    scaledAreasToRemove.forEach(area => {
      get().removeScaledSimulationArea(area.id);
    });
  },

  duplicateZone: (zoneId: string) => {
    const state = get();
    const zoneToDuplicate = state.payload.zones.find(z => z.id === zoneId);

    if (!zoneToDuplicate) return;

    const newZoneId = uuidv4();

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
        scale: [...sessionData.scale] as [number, string]
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

  addCustomSimulationArea: (): string => {
    const areaId = uuidv4();

    // Add to payload (coords only)
    set((state) => ({
      payload: {
        ...state.payload,
        customSimulationAreas: [
          ...state.payload.customSimulationAreas,
          {
            id: areaId,
            coords: null
          }
        ]
      }
    }));

    // Initialize session data
    const sessionStore = useEZSessionStore.getState();
    sessionStore.setCustomAreaData(areaId, {
      name: generateDefaultName('customArea'),
      color: '#00BCD4'
    });

    return areaId;
  },

  setCustomSimulationAreas: (areas: CustomSimulationArea[]) =>
    set((state) => ({
      payload: { ...state.payload, customSimulationAreas: areas }
    })),

  updateCustomSimulationArea: (areaId: string, data: Partial<CustomSimulationArea>) => {
    set((state) => ({
      payload: {
        ...state.payload,
        customSimulationAreas: state.payload.customSimulationAreas.map(area =>
          area.id === areaId ? { ...area, ...data } : area
        )
      }
    }));
  },

  removeCustomSimulationArea: (areaId: string) => {
    set((state) => ({
      payload: {
        ...state.payload,
        customSimulationAreas: state.payload.customSimulationAreas.filter(
          area => area.id !== areaId
        )
      }
    }));

    // Clean up session data
    useEZSessionStore.getState().removeCustomArea(areaId);
  },

  addScaledSimulationArea: (zoneId: string, coords: Coordinate[][]): string => {
    const areaId = uuidv4();

    // Add to payload (coords only)
    set((state) => ({
      payload: {
        ...state.payload,
        scaledSimulationAreas: [
          ...state.payload.scaledSimulationAreas,
          {
            id: areaId,
            zoneId,
            coords
          }
        ]
      }
    }));

    // Initialize session data from zone
    const sessionStore = useEZSessionStore.getState();
    const zoneData = sessionStore.zones[zoneId];
    if (zoneData) {
      sessionStore.setScaledAreaData(areaId, {
        scale: zoneData.scale,
        color: zoneData.color
      });
    }

    return areaId;
  },

  setScaledSimulationAreas: (areas: ScaledSimulationArea[]) =>
    set((state) => ({
      payload: { ...state.payload, scaledSimulationAreas: areas }
    })),

  updateScaledSimulationArea: (areaId: string, data: Partial<ScaledSimulationArea>) => {
    set((state) => ({
      payload: {
        ...state.payload,
        scaledSimulationAreas: state.payload.scaledSimulationAreas.map(area =>
          area.id === areaId ? { ...area, ...data } : area
        )
      }
    }));
  },

  removeScaledSimulationArea: (areaId: string) => {
    set((state) => ({
      payload: {
        ...state.payload,
        scaledSimulationAreas: state.payload.scaledSimulationAreas.filter(
          area => area.id !== areaId
        )
      }
    }));

    // Clean up session data
    useEZSessionStore.getState().removeScaledArea(areaId);
  },

  getScaledAreaByZoneId: (zoneId: string): ScaledSimulationArea | undefined => {
    const state = get();
    return state.payload.scaledSimulationAreas.find(area => area.zoneId === zoneId);
  },

  upsertScaledSimulationArea: (zoneId: string, coords: Coordinate[][]): string => {
    const state = get();
    const existingArea = state.payload.scaledSimulationAreas.find(area => area.zoneId === zoneId);

    if (existingArea) {
      // Update coords in payload
      set((state) => ({
        payload: {
          ...state.payload,
          scaledSimulationAreas: state.payload.scaledSimulationAreas.map(area =>
            area.zoneId === zoneId ? { ...area, coords } : area
          )
        }
      }));

      // Sync session data from zone
      const sessionStore = useEZSessionStore.getState();
      const zoneData = sessionStore.zones[zoneId];
      if (zoneData) {
        sessionStore.setScaledAreaData(existingArea.id, {
          scale: zoneData.scale,
          color: zoneData.color
        });
      }

      return existingArea.id;
    } else {
      // Create new
      return get().addScaledSimulationArea(zoneId, coords);
    }
  },

  setZones: (zones: Zone[]) =>
    set((state) => ({
      payload: { ...state.payload, zones }
    })),

  setSources: (sources: Sources) =>
    set((state) => ({
      payload: { ...state.payload, sources }
    })),

  setSimulationOptions: (simulationOptions: SimulationOptions) =>
    set((state) => ({
      payload: { ...state.payload, simulationOptions }
    })),

  setCarDistribution: (carDistribution: CarDistribution) =>
    set((state) => ({
      payload: { ...state.payload, carDistribution }
    })),

  setModeUtilities: (modeUtilities: ModeUtilities) =>
    set((state) => ({
      payload: { ...state.payload, modeUtilities }
    })),

  reset: () =>
    set({ payload: createInitialPayload() })
}));

// ============= DRAWING STATE STORE =============
export { useDrawingStateStore } from './drawingState';

// ============= RESET =============
export { resetAllEZStores } from './reset';
