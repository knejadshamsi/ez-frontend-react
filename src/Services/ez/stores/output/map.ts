import { create } from 'zustand';
import type { EZOutputMapStoreState, EZOutputMapStoreData } from './types';

// === MAP STORE ===

const createInitialMapState = (): EZOutputMapStoreData => ({
  emissionsMapState: 'inactive',
  emissionsMapData: null,
  emissionsMapError: null,
  peopleResponseMapState: 'inactive',
  peopleResponseMapData: null,
  peopleResponseMapError: null,
  tripLegsMapState: 'inactive',
  tripLegsMapData: null,
  tripLegsMapError: null,
});

export const useEZOutputMapStore = create<EZOutputMapStoreState>((set) => ({
  ...createInitialMapState(),

  setEmissionsMapState: (emissionsMapState) => set({ emissionsMapState }),
  setEmissionsMapData: (emissionsMapData) => set({ emissionsMapData }),
  setEmissionsMapError: (emissionsMapError) => set({ emissionsMapError }),

  setPeopleResponseMapState: (peopleResponseMapState) => set({ peopleResponseMapState }),
  setPeopleResponseMapData: (peopleResponseMapData) => set({ peopleResponseMapData }),
  setPeopleResponseMapError: (peopleResponseMapError) => set({ peopleResponseMapError }),

  setTripLegsMapState: (tripLegsMapState) => set({ tripLegsMapState }),
  setTripLegsMapData: (tripLegsMapData) => set({ tripLegsMapData }),
  setTripLegsMapError: (tripLegsMapError) => set({ tripLegsMapError }),

  resetMapStore: () => set(createInitialMapState()),
}));
