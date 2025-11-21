import { create } from 'zustand';
import type { EmissionsMapData, PeopleResponseMapData, MapPathData } from './types';

// === MAP STORE ===

interface EZOutputMapStoreState {
  /* Emissions map data */
  emissionsMapData: EmissionsMapData | null;
  isEmissionsMapLoading: boolean;
  emissionsMapError: string | null;

  /* People response map data */
  peopleResponseMapData: PeopleResponseMapData | null;
  isPeopleResponseMapLoading: boolean;
  peopleResponseMapError: string | null;

  /* Trip legs map data */
  tripLegsMapData: MapPathData[];
  isTripLegsMapLoading: boolean;
  tripLegsMapError: string | null;

  /* Emissions actions */
  setEmissionsMapData: (data: EmissionsMapData) => void;
  setEmissionsMapLoading: (isLoading: boolean) => void;
  setEmissionsMapError: (error: string | null) => void;

  /* People response actions */
  setPeopleResponseMapData: (data: PeopleResponseMapData) => void;
  setPeopleResponseMapLoading: (isLoading: boolean) => void;
  setPeopleResponseMapError: (error: string | null) => void;

  /* Trip legs actions */
  setTripLegsMapData: (data: MapPathData[]) => void;
  setTripLegsMapLoading: (isLoading: boolean) => void;
  setTripLegsMapError: (error: string | null) => void;

  /* Reset */
  resetMapStore: () => void;
}

const createInitialMapState = () => ({
  emissionsMapData: null as EmissionsMapData | null,
  isEmissionsMapLoading: false,
  emissionsMapError: null as string | null,
  peopleResponseMapData: null as PeopleResponseMapData | null,
  isPeopleResponseMapLoading: false,
  peopleResponseMapError: null as string | null,
  tripLegsMapData: [] as MapPathData[],
  isTripLegsMapLoading: false,
  tripLegsMapError: null as string | null,
});

export const useEZOutputMapStore = create<EZOutputMapStoreState>((set) => ({
  ...createInitialMapState(),

  setEmissionsMapData: (emissionsMapData) => set({ emissionsMapData }),
  setEmissionsMapLoading: (isEmissionsMapLoading) => set({ isEmissionsMapLoading }),
  setEmissionsMapError: (emissionsMapError) => set({ emissionsMapError }),

  setPeopleResponseMapData: (peopleResponseMapData) => set({ peopleResponseMapData }),
  setPeopleResponseMapLoading: (isPeopleResponseMapLoading) => set({ isPeopleResponseMapLoading }),
  setPeopleResponseMapError: (peopleResponseMapError) => set({ peopleResponseMapError }),

  setTripLegsMapData: (tripLegsMapData) => set({ tripLegsMapData }),
  setTripLegsMapLoading: (isTripLegsMapLoading) => set({ isTripLegsMapLoading }),
  setTripLegsMapError: (tripLegsMapError) => set({ tripLegsMapError }),

  resetMapStore: () => set(createInitialMapState()),
}));
