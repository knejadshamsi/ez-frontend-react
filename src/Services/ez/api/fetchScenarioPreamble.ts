import { getBackendUrl } from './config';
import type { ScenarioStatus } from '~stores/scenario';
import type { MainInputPayload, ScenarioMetadata } from '~stores/types';

const PREAMBLE_TIMEOUT_MS = 10000;

interface ScenarioPreamble {
  status: ScenarioStatus;
  input: MainInputPayload;
  session: ScenarioMetadata;
  pinned: boolean;
}

// Fetches scenario preamble data (status, input, session, pin) from the SSE
// endpoint as a one-shot request. Resolves once all 4 fields are collected,
// then aborts the connection. No heartbeat timers or long-lived infrastructure.
export async function fetchScenarioPreamble(
  requestId: string
): Promise<ScenarioPreamble> {
  const backendUrl = getBackendUrl();
  const abortController = new AbortController();

  const timeout = setTimeout(() => {
    abortController.abort();
  }, PREAMBLE_TIMEOUT_MS);

  try {
    const response = await fetch(`${backendUrl}/scenario/${requestId}`, {
      method: 'GET',
      headers: { 'Accept': 'text/event-stream' },
      signal: abortController.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    let status: ScenarioStatus | null = null;
    let input: MainInputPayload | null = null;
    let session: ScenarioMetadata | null = null;
    let pinned: boolean | null = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data:')) continue;

        try {
          const message = JSON.parse(line.slice(5).trimStart());

          switch (message.messageType) {
            case 'scenario_status':
              status = message.payload.status as ScenarioStatus;
              break;
            case 'scenario_input':
              input = message.payload as unknown as MainInputPayload;
              break;
            case 'scenario_session':
              session = message.payload as unknown as ScenarioMetadata;
              break;
            case 'scenario_pin':
              pinned = message.payload.pinned as boolean;
              break;
          }

          if (status && input && session && pinned !== null) {
            abortController.abort();
            return { status, input, session, pinned };
          }
        } catch {
          // Skip unparseable lines
        }
      }
    }

    // Stream ended before all preamble arrived
    if (status && input && session && pinned !== null) {
      return { status, input, session, pinned };
    }

    throw new Error('Stream ended before all preamble data was received');
  } finally {
    clearTimeout(timeout);
    abortController.abort();
  }
}
