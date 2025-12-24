import { create } from 'zustand';
import type { EmissionsMapData, PeopleResponseMapData, MapPathData, OutputComponentState } from './types';

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
  tripLegsMapData: MapPathData[];
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
  setTripLegsMapData: (data: MapPathData[]) => void;
  setTripLegsMapError: (error: string | null) => void;

  /* Reset */
  resetMapStore: () => void;
}

const createInitialMapState = () => ({
  emissionsMapState: 'inactive' as OutputComponentState,
  emissionsMapData: null as EmissionsMapData | null,
  emissionsMapError: null as string | null,
  peopleResponseMapState: 'inactive' as OutputComponentState,
  peopleResponseMapData: null as PeopleResponseMapData | null,
  peopleResponseMapError: null as string | null,
  tripLegsMapState: 'inactive' as OutputComponentState,
  tripLegsMapData: [] as MapPathData[],
  tripLegsMapError: null as string | null,
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
