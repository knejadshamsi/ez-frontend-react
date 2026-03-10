import { create } from 'zustand';
import type { EmissionsMapData, PeopleResponseMapData, TripLegsMapData, OutputComponentState } from './types';

// === MAP STORE ===

interface EZOutputMapStoreState {
  /* Emissions map state */
  emissionsMapState: OutputComponentState;
  emissionsMapData: EmissionsMapData | null;
  emissionsMapError: string | null;

  /* People response map state */
  peopleResponseMapState: OutputComponentState;
  peopleResponseMapData: PeopleResponseMapData | null;
  peopleResponseMapError: string | null;

  /* Trip legs map state */
  tripLegsMapState: OutputComponentState;
  tripLegsMapData: TripLegsMapData | null;
  tripLegsMapError: string | null;

  /* Emissions actions */
  setEmissionsMapState: (state: OutputComponentState) => void;
  setEmissionsMapData: (data: EmissionsMapData) => void;
  setEmissionsMapError: (error: string | null) => void;

  /* People response actions */
  setPeopleResponseMapState: (state: OutputComponentState) => void;
  setPeopleResponseMapData: (data: PeopleResponseMapData) => void;
  setPeopleResponseMapError: (error: string | null) => void;

  /* Trip legs actions */
  setTripLegsMapState: (state: OutputComponentState) => void;
  setTripLegsMapData: (data: TripLegsMapData) => void;
  setTripLegsMapError: (error: string | null) => void;

  /* Reset */
  resetMapStore: () => void;
}

const createInitialMapState = () => ({
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
