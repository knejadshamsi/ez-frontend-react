import { create } from 'zustand';
import type { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';

type EZState = 'WELCOME' | 'PARAMETER_SELECTION' | 'EMISSION_ZONE_SELECTION' | 'SIMULATION_AREA_SELECTION' | 'WAITING_FOR_RESULT' | 'RESULT_VIEW';

interface EZServiceStore {
  state: EZState;
  isEzBackendAlive: boolean;
  setState: (value: EZState) => void;
  setIsEzBackendAlive: (alive: boolean) => void;
  reset: () => void;
}

export const useEZServiceStore = create<EZServiceStore>((set) => ({
  state: 'WELCOME',
  isEzBackendAlive: false,
  setState: (value) => set({ state: value }),
  setIsEzBackendAlive: (alive) => set({ isEzBackendAlive: alive }),
  reset: () => set({ state: 'WELCOME', isEzBackendAlive: false }),
}));

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
