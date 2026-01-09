import { useEZServiceStore, useAPIPayloadStore, useDrawToolStore, createInitialPayload } from '~store';
import { useEZSessionStore, createInitialSessionState } from '~stores/session';
import { hasOutputData } from '~stores/output';
import type { EZStateType } from '~stores/types';
import type { ExitWarning } from '~stores/session/types';
import { DEFAULT_ZONE_ID } from '~stores/types';

// ===== HELPER FUNCTIONS =====

// Checks if input has changed from default state
const hasInputChangedFromDefault = (): boolean => {
  const payload = useAPIPayloadStore.getState().payload;
  const drawToolGeoJson = useDrawToolStore.getState().drawToolGeoJson;
  const sessionStore = useEZSessionStore.getState();

  const defaults = createInitialPayload();
  const sessionDefaults = createInitialSessionState();

  if (payload.zones.some(z => z.coords !== null && z.coords.length > 0)) return true;
  if (payload.zones.length !== defaults.zones.length) return true;
  if (payload.zones.some(z => z.policies && z.policies.length > 0)) return true;
  if (payload.zones.some(z => z.trip.length !== 1 || z.trip[0] !== 'start')) return true;
  if (payload.customSimulationAreas.length > 0 || payload.scaledSimulationAreas.length > 0) return true;
  if (JSON.stringify(payload.carDistribution) !== JSON.stringify(defaults.carDistribution)) return true;
  if (JSON.stringify(payload.modeUtilities) !== JSON.stringify(defaults.modeUtilities)) return true;
  if (JSON.stringify(payload.simulationOptions) !== JSON.stringify(defaults.simulationOptions)) return true;
  if (JSON.stringify(payload.sources) !== JSON.stringify(defaults.sources)) return true;
  if (drawToolGeoJson.features.length > 0) return true;
  if (sessionStore.scenarioTitle !== sessionDefaults.scenarioTitle) return true;
  if (sessionStore.scenarioDescription !== sessionDefaults.scenarioDescription) return true;
  if (sessionStore.zones[DEFAULT_ZONE_ID]?.name !== sessionDefaults.zones[DEFAULT_ZONE_ID]?.name) return true;

  return false;
};

// Checks if zones are configured with coordinates
const hasConfiguredZones = (): boolean => {
  const payload = useAPIPayloadStore.getState().payload;
  return (
    payload.zones.length > 0 &&
    payload.zones.some(z => z.coords !== null && z.coords.length > 0)
  );
};

// Determines if exit warning is needed based on demo mode or current EZ state
const getExitWarning = (ezState: EZStateType): ExitWarning | null => {
  const isEzBackendAlive = useEZServiceStore.getState().isEzBackendAlive;

  // GATE 1: Check if demo mode
  if (!isEzBackendAlive) {
    // In demo mode, only warn if input actually changed from default
    if (hasInputChangedFromDefault()) {
      return {
        title: 'Input Data Will Be Lost',
        message: 'You have configured input parameters. All input data will be lost. Continue?',
      };
    }
    return null;
  }

  // Live mode - use state-based warnings
  switch (ezState) {
    case 'WELCOME':
      return null;

    case 'PARAMETER_SELECTION':
      if (hasConfiguredZones()) {
        return {
          title: 'Unsaved Configuration',
          message: 'You have configured emission zones and parameters. Session will be lost. Continue?',
        };
      }
      return null;

    case 'DRAW_EM_ZONE':
      return {
        title: 'Unsaved Emission Zone',
        message: 'You have an unsaved emission zone. Session will be lost. Continue?',
      };

    case 'EDIT_EM_ZONE':
      return {
        title: 'Unsaved Changes',
        message: 'You have unsaved changes to the emission zone. Session will be lost. Continue?',
      };

    case 'REDRAW_EM_ZONE':
      return {
        title: 'Zone Redraw in Progress',
        message: 'You are redrawing an emission zone. Session will be lost. Continue?',
      };

    case 'DRAW_SIM_AREA':
      return {
        title: 'Unsaved Simulation Area',
        message: 'You have an unsaved simulation area. Session will be lost. Continue?',
      };

    case 'EDIT_SIM_AREA':
      return {
        title: 'Unsaved Changes',
        message: 'You have unsaved changes to the simulation area. Session will be lost. Continue?',
      };

    case 'AWAIT_RESULTS':
      return {
        title: 'Simulation in Progress',
        message: 'The simulation is currently running and will be aborted. All progress will be lost. Continue?',
      };

    case 'RESULT_VIEW':
      if (hasOutputData()) {
        return {
          title: 'Session Will Be Lost',
          message: 'Session will be lost. Make sure to save your request ID before exiting. Continue?',
        };
      }
      return null;

    default:
      return null;
  }
};

// ===== MAIN LOGIC =====

// Handles exit from EZ service
export const handleExit = (): void => {
  console.log('[EZ Exit] handleExit called');

  const ezState = useEZServiceStore.getState().state;
  console.log('[EZ Exit] Current EZ state:', ezState);

  const sessionStore = useEZSessionStore.getState();
  const { exitState, setExitState, setExitWarning } = sessionStore;
  console.log('[EZ Exit] Current exit state:', exitState);

  // Guard: Already processing an exit
  if (exitState !== 'idle') {
    console.log('[EZ Exit] Already processing, ignoring');
    return;
  }

  // Check if warning needed
  const warning = getExitWarning(ezState);
  console.log('[EZ Exit] Warning:', warning);

  if (warning) {
    console.log('[EZ Exit] Setting state to await_confirmation');
    setExitState('await_confirmation');
    setExitWarning(warning);
  } else {
    console.log('[EZ Exit] Setting state to resetting');
    setExitState('resetting');
  }
};

// Called by UI when user confirms exit
export const confirmExit = (): void => {
  useEZSessionStore.getState().setExitState('resetting');
};

// Called by UI when user cancels exit
export const cancelExit = (): void => {
  const sessionStore = useEZSessionStore.getState();
  sessionStore.setExitState('idle');
  sessionStore.setExitWarning(null);
};
