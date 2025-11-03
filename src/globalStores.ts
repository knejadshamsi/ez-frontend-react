import { create } from 'zustand';
import { ServiceType, ZeleStateType, Coordinate } from './types';

interface ServiceStore {
  activeService: ServiceType;
  setActiveService: (value: ServiceType) => void;
  resetService: () => void;
}

export const useServiceStore = create<ServiceStore>((set) => ({
  activeService: "REST",
  setActiveService: (value) => { set({ activeService: value }) },
  resetService: () => { set({ activeService: "REST" }) },
}));

interface ZeleStore {
  zele: ZeleStateType;
  setZeleState: (value: ZeleStateType) => void;
  resetZele: () => void;
}

export const useZeleStore = create<ZeleStore>((set) => ({
  zele: "WELCOME",
  setZeleState: (value) => { set({ zele: value }) },
  resetZele: () => { set({ zele: "WELCOME" }) },
}));

interface ZoneSelectionStore {
  finalArea: Coordinate[] | null;
  setFinalArea: (value: Coordinate[] | null) => void;
}

export const useZoneSelectionStore = create<ZoneSelectionStore>((set) => ({
  finalArea: null,
  setFinalArea: (value) => { set({ finalArea: value }) },
}));

interface ResultStore {
  tab: string;
  setTab: (value: string) => void;
}

export const useResultStore = create<ResultStore>((set) => ({
  tab: "1",
  setTab: (value) => { set({ tab: value }) },
}));

export const Constants = {
  EZ: 'ez',
  ZELE: 'ZELE',
  REST: 'REST',
};
