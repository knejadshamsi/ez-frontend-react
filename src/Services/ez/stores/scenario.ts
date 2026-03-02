import { create } from 'zustand';
import { useAPIPayloadStore } from './index';
import { useEZSessionStore } from './session';
import type { MainInputPayload, ScenarioMetadata } from './types';

export type ScenarioStatus = 'COMPLETED' | 'CANCELLED' | 'FAILED' | 'DELETED';

interface ScenarioSnapshotStore {
  status: ScenarioStatus | null;
  input: MainInputPayload | null;
  session: ScenarioMetadata | null;
  setStatus: (status: ScenarioStatus) => void;
  setInput: (input: MainInputPayload) => void;
  setSession: (session: ScenarioMetadata) => void;
  reset: () => void;
}

export const useScenarioSnapshotStore = create<ScenarioSnapshotStore>((set) => ({
  status: null,
  input: null,
  session: null,
  setStatus: (status) => set({ status }),
  setInput: (input) => set({ input }),
  setSession: (session) => set({ session }),
  reset: () => set({ status: null, input: null, session: null }),
}));

// Compares current editable stores against the immutable snapshot
export const hasInputChanged = (): boolean => {
  const snapshot = useScenarioSnapshotStore.getState().input;
  if (!snapshot) return true; // No snapshot = treat as changed

  const payload = useAPIPayloadStore.getState().payload;
  const session = useEZSessionStore.getState();

  const current: MainInputPayload = {
    scenarioTitle: session.scenarioTitle,
    scenarioDescription: session.scenarioDescription,
    zones: payload.zones,
    customSimulationAreas: payload.customSimulationAreas,
    scaledSimulationAreas: payload.scaledSimulationAreas,
    sources: payload.sources,
    simulationOptions: payload.simulationOptions,
    carDistribution: payload.carDistribution,
    modeUtilities: payload.modeUtilities,
  };

  return JSON.stringify(current) !== JSON.stringify(snapshot);
};
