import axios from 'axios';
import { getBackendUrl } from './config';
import { useEZSessionStore } from '~stores/session';
import { ApiResponse } from './apiResponse';

// Cancels running simulation: notifies backend, closes SSE connection, cleans up resources
export async function cancelSimulation(requestId: string): Promise<void> {
  const backendUrl = getBackendUrl();
  const sessionStore = useEZSessionStore.getState();
  const cleanup = sessionStore.sseCleanup;

  // Notify backend to stop
  try {
    const response = await axios.post<ApiResponse<void>>(
      `${backendUrl}/scenario/cancel`,
      { requestId },
      { timeout: 5000 }
    );

    if (response.data.statusCode !== 200) {
      throw new Error(`Cancel failed: ${response.data.message}`);
    }
  } catch (error) {
    console.error('[Cancel] Backend notification failed:', error);
  }

  // Close SSE connection and cleanup
  if (cleanup) {
    cleanup();
    sessionStore.setSseCleanup(null);
  }
}
