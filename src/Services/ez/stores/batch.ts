import { create } from 'zustand';

// ============= BATCH SIMULATION TYPES =============

export type BackgroundSimStatus = 'new' | 'queued' | 'running' | 'completed' | 'error' | 'drafted';

export interface BackgroundSimulation {
  requestId: string;
  status: BackgroundSimStatus;
  errorMessage?: string;
}

export interface BatchStore {
  isBatchMode: boolean;
  simulations: BackgroundSimulation[];
  activeSimId: string | null;
  addSimulation: (requestId: string, status: BackgroundSimStatus) => void;
  updateStatus: (requestId: string, status: BackgroundSimStatus, errorMessage?: string) => void;
  removeSimulation: (requestId: string) => void;
  setActiveSimId: (id: string | null) => void;
  reset: () => void;
}

// ============= BATCH STORE =============

export const useBatchStore = create<BatchStore>((set) => ({
  isBatchMode: false,
  simulations: [],
  activeSimId: null,

  addSimulation: (requestId, status) =>
    set((state) => {
      if (state.simulations.some((s) => s.requestId === requestId)) {
        return { isBatchMode: true };
      }
      return {
        isBatchMode: true,
        simulations: [...state.simulations, { requestId, status }],
        ...(status === 'new' ? { activeSimId: requestId } : {}),
      };
    }),

  updateStatus: (requestId, status, errorMessage) =>
    set((state) => ({
      simulations: state.simulations.map((sim) =>
        sim.requestId === requestId
          ? { ...sim, status, ...(errorMessage !== undefined ? { errorMessage } : {}) }
          : sim
      ),
    })),

  removeSimulation: (requestId) =>
    set((state) => {
      const simulations = state.simulations.filter((sim) => sim.requestId !== requestId);
      return {
        simulations,
        isBatchMode: simulations.length > 0,
        ...(state.activeSimId === requestId ? { activeSimId: null } : {}),
      };
    }),

  setActiveSimId: (id) => set({ activeSimId: id }),

  reset: () => set({ isBatchMode: false, simulations: [], activeSimId: null }),
}));
