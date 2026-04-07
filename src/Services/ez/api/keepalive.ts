import axios from 'axios';
import { getBackendUrl } from './config';

export async function sendKeepalive(requestId: string): Promise<void> {
  try {
    await axios.post(`${getBackendUrl()}/scenario/${requestId}/keepalive`);
  } catch {
    // Best-effort - errors are safely ignored per spec
  }
}
