import { useEffect } from 'react';
import { useEZServiceStore } from '~store';
import { checkBackendHealth, getBackendUrl } from '~ez/api';

const POLL_INTERVAL_MS = 60000;

const SKIP_STATES = new Set([
  'AWAIT_RESULTS',
  'DRAW_EM_ZONE',
  'EDIT_EM_ZONE',
  'REDRAW_EM_ZONE',
  'DRAW_SIM_AREA',
  'EDIT_SIM_AREA',
]);

export const useHealthCheckPolling = (): void => {
  const ezState = useEZServiceStore((state) => state.state);

  useEffect(() => {
    if (SKIP_STATES.has(ezState)) return;

    const interval = setInterval(() => {
      checkBackendHealth(`${getBackendUrl()}/health`);
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [ezState]);
};
