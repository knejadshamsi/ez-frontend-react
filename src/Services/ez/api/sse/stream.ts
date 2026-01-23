import { resetAllEZOutputStores, setIncompleteComponentsToError } from '~stores/output';
import type { SSEMessage, SimulationStreamConfig } from './types';
import { handleSSEMessage } from './handlers';

const UNIVERSAL_TIMEOUT_MS = 300000;

// Starts an SSE simulation stream with lifecycle management
export function startSimulationStream(config: SimulationStreamConfig): () => void {
  const {
    endpoint,
    payload,
    method = 'POST',
    connectionTimeout = 30000,
    heartbeatTimeout = 35000,
  } = config;

  resetAllEZOutputStores();

  let abortController: AbortController | null = new AbortController();
  let heartbeatTimeoutId: NodeJS.Timeout | null = null;
  let connectionTimeoutId: NodeJS.Timeout | null = null;
  let universalTimeoutId: NodeJS.Timeout | null = null;

  const resetHeartbeatTimer = () => {
    if (heartbeatTimeoutId) {
      clearTimeout(heartbeatTimeoutId);
    }
    heartbeatTimeoutId = setTimeout(() => {
      console.error('[SSE] Heartbeat timeout - connection lost');
      config.onError?.({
        code: 'HEARTBEAT_TIMEOUT',
        message: 'Connection lost - no heartbeat received',
      });
      cleanup();
    }, heartbeatTimeout);
  };

  const resetUniversalTimer = () => {
    if (universalTimeoutId) {
      clearTimeout(universalTimeoutId);
    }
    universalTimeoutId = setTimeout(() => {
      console.error('[SSE] Universal timeout - no data received within 5 minutes');

      // Set all incomplete components to error state
      setIncompleteComponentsToError();

      config.onError?.({
        code: 'UNIVERSAL_TIMEOUT',
        message: 'Simulation timeout - some components may have failed',
      });
      cleanup();
    }, UNIVERSAL_TIMEOUT_MS);
  };

  const cleanup = () => {
    if (heartbeatTimeoutId) {
      clearTimeout(heartbeatTimeoutId);
      heartbeatTimeoutId = null;
    }
    if (connectionTimeoutId) {
      clearTimeout(connectionTimeoutId);
      connectionTimeoutId = null;
    }
    if (universalTimeoutId) {
      clearTimeout(universalTimeoutId);
      universalTimeoutId = null;
    }
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
  };

  connectionTimeoutId = setTimeout(() => {
    console.error('[SSE] Connection timeout');
    config.onError?.({
      code: 'CONNECTION_TIMEOUT',
      message: 'Failed to connect to simulation server',
    });
    cleanup();
  }, connectionTimeout);

  const fetchOptions: RequestInit = {
    method,
    headers: method === 'POST' ? {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    } : {
      'Accept': 'text/event-stream',
    },
    signal: abortController.signal,
  };

  if (method === 'POST' && payload) {
    fetchOptions.body = JSON.stringify(payload);
  }

  fetch(endpoint, fetchOptions)
    .then(async (response) => {
      if (connectionTimeoutId) {
        clearTimeout(connectionTimeoutId);
        connectionTimeoutId = null;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      resetHeartbeatTimer();
      resetUniversalTimer();

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log('[SSE] Stream ended');
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6);
              const message: SSEMessage = JSON.parse(jsonStr);

              resetHeartbeatTimer();

              // Reset universal timer only for data messages (not heartbeats)
              if (message.messageType.startsWith('data_')) {
                resetUniversalTimer();
              }

              handleSSEMessage(message, config);
            } catch (parseError) {
              console.error('[SSE] Failed to parse message:', line, parseError);
            }
          }
        }
      }

      cleanup();
    })
    .catch((error) => {
      if (error.name === 'AbortError') {
        console.log('[SSE] Stream aborted');
      } else {
        console.error('[SSE] Stream error:', error);
        config.onError?.({
          code: 'STREAM_ERROR',
          message: error.message || 'Stream connection failed',
        });
      }
      cleanup();
    });

  return cleanup;
}
