import { create } from 'zustand';
import { useAPIPayloadStore } from './index';
import { useEZSessionStore } from './session';
import type { MainInputPayload, ScenarioMetadata } from './types';

export type ScenarioStatus = 'COMPLETED' | 'CANCELLED' | 'FAILED' | 'DELETED';

// ============= SSE PREAMBLE STORE =============
// Temporary buffer for scenario data arriving via SSE preamble messages.
// Used by SSE handlers and welcome screen (non-completed scenario restore).

interface ScenarioPreambleStore {
  status: ScenarioStatus | null;
  input: MainInputPayload | null;
  session: ScenarioMetadata | null;
  setStatus: (status: ScenarioStatus) => void;
  setInput: (input: MainInputPayload) => void;
  setSession: (session: ScenarioMetadata) => void;
  reset: () => void;
}

export const useScenarioPreambleStore = create<ScenarioPreambleStore>((set) => ({
  status: null,
  input: null,
  session: null,
  setStatus: (status) => set({ status, input: null, session: null }),
  setInput: (input) => set({ input }),
  setSession: (session) => set({ session }),
  reset: () => set({ status: null, input: null, session: null }),
}));

// ============= INPUT SNAPSHOT STORE =============
// Immutable copy of input data at the time results were generated.
// Used ONLY for restoring inputs when user discards changes.
// Never compared against current state.

interface InputSnapshotStore {
  input: MainInputPayload | null;
  session: ScenarioMetadata | null;
  save: () => void;
  reset: () => void;
}

export const useInputSnapshotStore = create<InputSnapshotStore>((set) => ({
  input: null,
  session: null,
  save: () => {
    const payload = useAPIPayloadStore.getState().payload;
    const sessionStore = useEZSessionStore.getState();

    set({
      input: {
        scenarioTitle: sessionStore.scenarioTitle,
        scenarioDescription: sessionStore.scenarioDescription,
        zones: structuredClone(payload.zones),
        customSimulationAreas: structuredClone(payload.customSimulationAreas),
        scaledSimulationAreas: structuredClone(payload.scaledSimulationAreas),
        sources: structuredClone(payload.sources),
        simulationOptions: structuredClone(payload.simulationOptions),
        carDistribution: structuredClone(payload.carDistribution),
        modeUtilities: structuredClone(payload.modeUtilities),
      },
      session: structuredClone({
        zoneSessionData: sessionStore.zones,
        simulationAreaDisplay: sessionStore.simulationAreaDisplay,
        carDistributionCategories: sessionStore.carDistributionCategories,
        customAreaSessionData: sessionStore.customAreas,
        scaledAreaSessionData: sessionStore.scaledAreas,
        activeZone: sessionStore.activeZone,
        activeCustomArea: sessionStore.activeCustomArea,
      }),
    });
  },
  reset: () => set({ input: null, session: null }),
}));
