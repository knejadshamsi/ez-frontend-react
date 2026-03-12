import { useProgressStore } from './store';
import type { StepState } from './store';

const STATUS_MAP: Record<string, StepState> = {
  'started': 'in_progress',
  'complete': 'completed',
  'failed': 'failed',
};

export function decodeProgressAlert(message: string): boolean {
  // Strip pa_ prefix from SSE messages (demo mode sends without prefix)
  const normalized = message.startsWith('pa_') ? message.slice(3) : message;
  const statusSuffixes = ['_started', '_complete', '_failed'];

  for (const suffix of statusSuffixes) {
    if (normalized.endsWith(suffix)) {
      const statusKey = suffix.slice(1);
      const stepName = normalized.slice(0, -suffix.length);
      const stepState = STATUS_MAP[statusKey];

      if (!stepState) {
        console.warn(`[PA Decoder] Unknown status: ${statusKey}`);
        return false;
      }

      const store = useProgressStore.getState();
      store.handleEvent(stepName, stepState);

      return true;
    }
  }

  console.warn(`[PA Decoder] No valid status suffix found in: ${message}`);
  return false;
}
