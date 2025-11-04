import { create } from 'zustand';

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
