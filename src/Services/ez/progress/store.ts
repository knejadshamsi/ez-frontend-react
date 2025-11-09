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
  isVisible: boolean;
  completedSteps: StepStatus;
  errorMessage: string;
}

interface ProgressActions {
  show: () => void;
  hide: () => void;
  handleEvent: (stepName: string, stepState: StepState) => void;
  setError: (message: string) => void;
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
  isVisible: false,
  completedSteps: { ...initialSteps },
  errorMessage: '',

  show: () => set({
    isVisible: true,
    completedSteps: { ...initialSteps },
    errorMessage: '',
  }),

  hide: () => set({ isVisible: false }),

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
    errorMessage: message,
  }),

  reset: () => set({
    isVisible: false,
    completedSteps: { ...initialSteps },
    errorMessage: '',
  }),
}));

// Computed values

export const canViewResultsEarly = (steps: StepStatus): boolean => {
  return POSTPROCESSING_STEPS.some(step => steps[step] === 'completed');
};

export const areAllStepsComplete = (steps: StepStatus): boolean => {
  return Object.values(steps).every(state => state === 'completed');
};

export const hasAnyStepFailed = (steps: StepStatus): boolean => {
  return Object.values(steps).some(state => state === 'failed');
};

export const getProgressStatus = (state: ProgressState): 'running' | 'success' | 'error' | null => {
  if (!state.isVisible) return null;
  if (state.errorMessage) return 'error';
  if (areAllStepsComplete(state.completedSteps)) return 'success';
  return 'running';
};

// Public API

export const showProgress = (): void => {
  const store = useProgressStore.getState();
  if (!store.isVisible) {
    store.show();
  }
};

export const showProgressError = (message: string): void => {
  useProgressStore.getState().setError(message);
};

export const closeProgress = (): void => {
  useProgressStore.getState().hide();
};
