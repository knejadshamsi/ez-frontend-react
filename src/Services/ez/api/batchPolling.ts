import { fetchScenarioStatus, isTerminalStatus } from './scenarioStatus';
import { useBatchStore } from '~stores/batch';
import type { BackgroundSimStatus } from '~stores/batch';

const POLL_INTERVAL_MS = 15000;
const EXTENDED_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes - switch to slow polling
const EXTENDED_POLL_INTERVAL_MS = 60000; // 60 seconds between polls in extended mode
const MAX_POLL_DURATION_MS = 60 * 60 * 1000; // 60 minutes - hard timeout

let pollIntervalId: ReturnType<typeof setInterval> | null = null;
const pollStartTimes = new Map<string, number>();
const lastPolledAt = new Map<string, number>();

// Single-slot watcher: fires when a specific sim reaches a terminal status
let terminalWatcher: { requestId: string; onTerminal: (status: BackgroundSimStatus) => void } | null = null;

export const watchForCompletion = (requestId: string, onComplete: () => void): void => {
  terminalWatcher = { requestId, onTerminal: (status) => { if (status === 'completed') onComplete(); } };
};

export const watchForTerminal = (requestId: string, onTerminal: (status: BackgroundSimStatus) => void): void => {
  terminalWatcher = { requestId, onTerminal };
};

export const clearCompletionWatcher = (): void => {
  terminalWatcher = null;
};

export const mapBackendStatus = (status: string): BackgroundSimStatus => {
  switch (status) {
    case 'CREATED':
    case 'QUEUED':
      return 'queued';
    case 'VALIDATING':
    case 'SIMULATING':
    case 'SIMULATING_BASELINE':
    case 'SIMULATING_POLICY':
    case 'POSTPROCESSING':
      return 'running';
    case 'COMPLETED':
      return 'completed';
    case 'FAILED':
    case 'CANCELLED':
    case 'DELETED':
    default:
      return 'error';
  }
};

const isTerminalBatchStatus = (status: BackgroundSimStatus): boolean =>
  status === 'completed' || status === 'error' || status === 'drafted' || status === 'new';

async function pollAllSimulations(): Promise<void> {
  const { simulations, updateStatus } = useBatchStore.getState();
  const now = Date.now();

  const nonTerminal = simulations.filter((sim) => !isTerminalBatchStatus(sim.status));

  if (nonTerminal.length === 0) {
    stopBatchPolling();
    return;
  }

  for (const sim of nonTerminal) {
    const startTime = pollStartTimes.get(sim.requestId);
    const elapsed = startTime ? now - startTime : 0;

    // Hard timeout
    if (startTime && elapsed > MAX_POLL_DURATION_MS) {
      updateStatus(sim.requestId, 'error', 'Polling timed out after 60 minutes');
      pollStartTimes.delete(sim.requestId);
      lastPolledAt.delete(sim.requestId);
      if (terminalWatcher?.requestId === sim.requestId) {
        const cb = terminalWatcher.onTerminal;
        terminalWatcher = null;
        cb('error');
      }
      continue;
    }

    // Extended mode - skip this tick if polled recently
    if (elapsed > EXTENDED_THRESHOLD_MS) {
      const lastPoll = lastPolledAt.get(sim.requestId) || 0;
      if (now - lastPoll < EXTENDED_POLL_INTERVAL_MS) continue;
    }

    try {
      lastPolledAt.set(sim.requestId, now);
      const response = await fetchScenarioStatus(sim.requestId);
      const mappedStatus = mapBackendStatus(response.status);

      if (mappedStatus !== sim.status) {
        const errorMessage = isTerminalStatus(response.status) && mappedStatus === 'error'
          ? response.status
          : undefined;
        updateStatus(sim.requestId, mappedStatus, errorMessage);

        if (isTerminalBatchStatus(mappedStatus) && terminalWatcher?.requestId === sim.requestId) {
          const cb = terminalWatcher.onTerminal;
          terminalWatcher = null;
          cb(mappedStatus);
        }
      }

      if (isTerminalBatchStatus(mappedStatus)) {
        pollStartTimes.delete(sim.requestId);
        lastPolledAt.delete(sim.requestId);
      }
    } catch {
      // Network error - skip this tick, will retry next interval
    }
  }

  // Check if all are now terminal after this round
  const updatedSims = useBatchStore.getState().simulations;
  const stillPolling = updatedSims.some((sim) => !isTerminalBatchStatus(sim.status));
  if (!stillPolling) {
    stopBatchPolling();
  }
}

export const startBatchPolling = (): void => {
  // Record start time for any simulations not yet tracked
  const { simulations } = useBatchStore.getState();
  const now = Date.now();
  for (const sim of simulations) {
    if (!isTerminalBatchStatus(sim.status) && !pollStartTimes.has(sim.requestId)) {
      pollStartTimes.set(sim.requestId, now);
    }
  }

  if (pollIntervalId !== null) return; // Already polling

  // Poll immediately on start
  pollAllSimulations();

  pollIntervalId = setInterval(pollAllSimulations, POLL_INTERVAL_MS);
};

export const stopBatchPolling = (): void => {
  if (pollIntervalId !== null) {
    clearInterval(pollIntervalId);
    pollIntervalId = null;
  }
  pollStartTimes.clear();
  lastPolledAt.clear();
};
