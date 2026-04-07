import { create } from 'zustand';

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

interface ProgressState {
  completedSteps: StepStatus;
  errorMessage: string;
  pollingProgress: string | null;
}

interface ProgressActions {
  handleEvent: (stepName: string, stepState: StepState) => void;
  setErrorMessage: (message: string) => void;
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

const VALID_STEP_NAMES: StepName[] = [
  ...PREPROCESSING_STEPS,
  ...SIMULATING_STEPS,
  ...POSTPROCESSING_STEPS,
];

export const useProgressStore = create<ProgressState & ProgressActions>((set) => ({
  completedSteps: { ...initialSteps },
  errorMessage: '',
  pollingProgress: null,

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

  setErrorMessage: (message: string) => set({ errorMessage: message }),

  setPollingProgress: (progress: string | null) => set({
    pollingProgress: progress,
  }),

  reset: () => set({
    completedSteps: { ...initialSteps },
    errorMessage: '',
    pollingProgress: null,
  }),
}));

// Computed values

export const canViewResultsEarly = (steps: StepStatus): boolean => {
  return POSTPROCESSING_STEPS.some(step => steps[step] === 'completed');
};

