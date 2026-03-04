import { create } from 'zustand';
import { useEZSessionStore } from '~stores/session';

export type StepState = 'pending' | 'in_progress' | 'completed' | 'failed';

export type StepName =
  | 'preprocessing_population'
  | 'preprocessing_network'
  | 'preprocessing_transit'
  | 'preprocessing_config'
  | 'simulation_base'
  | 'simulation_policy'
  | 'postprocessing_overview'
  | 'postprocessing_emissions'
  | 'postprocessing_people_response'
  | 'postprocessing_trip_legs';

export type StepStatus = Record<StepName, StepState>;

export type ProgressStatus =
  | 'DISPLAY_SIMULATION'
  | 'DISPLAY_SCENARIO_LOAD'
  | 'DISPLAY_CANCELLATION'
  | 'DISPLAY_POLLING_RECOVERY'
  | 'DISPLAY_COMPLETE'
  | 'DISPLAY_ERROR';

interface ProgressState {
  status: ProgressStatus;
  completedSteps: StepStatus;
  errorMessage: string;
  pollingProgress: string | null;
}

interface ProgressActions {
  setStatus: (status: ProgressStatus) => void;
  handleEvent: (stepName: string, stepState: StepState) => void;
  setError: (message: string) => void;
  setPollingProgress: (progress: string | null) => void;
  reset: () => void;
}

const initialSteps: StepStatus = {
  preprocessing_population: 'pending',
  preprocessing_network: 'pending',
  preprocessing_transit: 'pending',
  preprocessing_config: 'pending',
  simulation_base: 'pending',
  simulation_policy: 'pending',
  postprocessing_overview: 'pending',
  postprocessing_emissions: 'pending',
  postprocessing_people_response: 'pending',
  postprocessing_trip_legs: 'pending',
};

const VALID_STEP_NAMES: StepName[] = [
  'preprocessing_population',
  'preprocessing_network',
  'preprocessing_transit',
  'preprocessing_config',
  'simulation_base',
  'simulation_policy',
  'postprocessing_overview',
  'postprocessing_emissions',
  'postprocessing_people_response',
  'postprocessing_trip_legs',
];

export const PREPROCESSING_STEPS: StepName[] = [
  'preprocessing_population',
  'preprocessing_network',
  'preprocessing_transit',
  'preprocessing_config',
];

export const SIMULATING_STEPS: StepName[] = [
  'simulation_base',
  'simulation_policy',
];

export const POSTPROCESSING_STEPS: StepName[] = [
  'postprocessing_overview',
  'postprocessing_emissions',
  'postprocessing_people_response',
  'postprocessing_trip_legs',
];

export const useProgressStore = create<ProgressState & ProgressActions>((set) => ({
  status: (useEZSessionStore.getState().isNewSimulation ? 'DISPLAY_SIMULATION' : 'DISPLAY_SCENARIO_LOAD') as ProgressStatus,
  completedSteps: { ...initialSteps },
  errorMessage: '',
  pollingProgress: null,

  setStatus: (status) => {
    if (status === 'DISPLAY_SIMULATION' || status === 'DISPLAY_SCENARIO_LOAD') {
      set({
        status,
        completedSteps: { ...initialSteps },
        errorMessage: '',
        pollingProgress: null,
      });
    } else {
      set({ status });
    }
  },

  handleEvent: (stepName: string, stepState: StepState) => set((state) => {
    if (!VALID_STEP_NAMES.includes(stepName as StepName)) {
      console.warn(`[Progress Store] Invalid step name: ${stepName}`);
      return state;
    }

    return {
      ...state,
      completedSteps: {
        ...state.completedSteps,
        [stepName]: stepState,
      },
    };
  }),

  setError: (message: string) => set({
    status: 'DISPLAY_ERROR',
    errorMessage: message,
  }),

  setPollingProgress: (progress: string | null) => set({
    pollingProgress: progress,
  }),

  reset: () => {
    const isNew = useEZSessionStore.getState().isNewSimulation;
    set({
      status: isNew ? 'DISPLAY_SIMULATION' : 'DISPLAY_SCENARIO_LOAD',
      completedSteps: { ...initialSteps },
      errorMessage: '',
      pollingProgress: null,
    });
  },
}));

// Computed values

export const canViewResultsEarly = (steps: StepStatus): boolean => {
  return POSTPROCESSING_STEPS.some(step => steps[step] === 'completed');
};

export const areAllStepsComplete = (steps: StepStatus): boolean => {
  return Object.values(steps).every(state => state === 'completed');
};
