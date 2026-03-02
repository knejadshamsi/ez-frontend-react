import axios from 'axios';
import { getBackendUrl } from './config';

export type CancelResult = 'success' | 'conflict' | 'timeout' | 'not_found' | 'error';

// Cancels a running simulation via long-poll REST endpoint.
// The backend blocks until cancellation is confirmed (up to 30s).
// Returns the result — caller handles cleanup and UI feedback.
export async function cancelSimulation(requestId: string): Promise<CancelResult> {
  const backendUrl = getBackendUrl();

  try {
    const response = await axios.post(
      `${backendUrl}/scenario/${requestId}/cancel`,
      null,
      { timeout: 35000, validateStatus: () => true }
    );

    switch (response.status) {
      case 200: return 'success';
      case 404: return 'not_found';
      case 408: return 'timeout';
      case 409: return 'conflict';
      default: return 'error';
    }
  } catch {
    return 'error';
  }
}
