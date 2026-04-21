import { useEffect, useRef } from 'react';
import { useEZServiceStore } from '~store';
import { useEZSessionStore } from '~stores/session';
import { checkBackendHealth, checkBackendHealthInitial, getBackendUrl } from '~ez/api';
import { loadScenario } from '~ez/api/startSimulation';
import { fetchScenarioStatus, isTerminalStatus } from '~ez/api/scenarioStatus';
import './locales';

const POLL_INTERVAL_MS = 30000;

export const useHealthCheckPolling = (): void => {
  const connectionState = useEZServiceStore((s) => s.connectionState);
  const ezState = useEZServiceStore((s) => s.state);
  const hasInitialized = useRef(false);

  // Initial health check on mount
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    checkBackendHealthInitial(`${getBackendUrl()}/health`);
  }, []);

  // ConnectionState-driven recovery (Phase 4.4)
  useEffect(() => {
    if (ezState !== 'PROCESS_CONNECTION_LOST') return;

    if (connectionState === 'HALF_CONNECT') {
      useEZServiceStore.getState().setState('PROCESS_POLLING');
    }
  }, [connectionState, ezState]);

  // Continuous polling
  useEffect(() => {
    const interval = setInterval(async () => {
      // Sleep while SSE is active
      if (useEZServiceStore.getState().isSseActive) return;

      const backendUrl = getBackendUrl();
      const isAlive = await checkBackendHealth(`${backendUrl}/health`);

      // Scenario status polling during PROCESS_POLLING (Phase 4.5)
      const currentState = useEZServiceStore.getState().state;
      if (currentState === 'PROCESS_POLLING' && isAlive) {
        await pollScenarioStatus();
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);
};

async function pollScenarioStatus(): Promise<void> {
  const requestId = useEZSessionStore.getState().requestId;
  if (!requestId || requestId.trim() === '') return;

  const { setState, setSessionIntent, connectionState } = useEZServiceStore.getState();

  try {
    const response = await fetchScenarioStatus(requestId);
    const { status } = response;

    if (!isTerminalStatus(status)) return; // RUNNING - keep polling

    if (status === 'COMPLETED') {
      if (connectionState === 'HALF_CONNECT' || connectionState === 'FULL_CONNECT') {
        setSessionIntent('LOAD_PREVIOUS_SCENARIO');
        loadScenario(requestId, setState, (errorMsg) => {
          console.error('[Polling Recovery] Load scenario failed:', errorMsg);
          setState('SELECT_PARAMETERS');
        });
      }
      // If disconnected, ignore - keep polling until connection is stable
    } else if (status === 'CANCELLED') {
      setState('SELECT_PARAMETERS');
    } else if (status === 'FAILED') {
      setState('SELECT_PARAMETERS');
    }
  } catch (error) {
    console.error('[Polling] Scenario status check failed:', error);
  }
}
