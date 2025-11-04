import { create } from 'zustand';

interface EZSessionStore {
  scenarioTitle: string;
  requestId: string;
  setScenarioTitle: (title: string) => void;
  setRequestId: (id: string) => void;
}

export const useEZSessionStore = create<EZSessionStore>((set) => ({
  scenarioTitle: 'New Scenario',
  requestId: '',
  setScenarioTitle: (scenarioTitle) => set({ scenarioTitle }),
  setRequestId: (requestId) => set({ requestId }),
}));
