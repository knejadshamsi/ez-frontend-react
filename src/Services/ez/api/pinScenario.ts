import axios from 'axios';
import { getBackendUrl } from './index';
import type { ApiResponse } from './apiResponse';

interface PinTogglePayload {
  requestId: string;
  pinned: boolean;
}

export async function toggleScenarioPin(requestId: string): Promise<boolean> {
  const response = await axios.post<ApiResponse<PinTogglePayload>>(
    `${getBackendUrl()}/scenario/${requestId}/pin`
  );
  return response.data.payload.pinned;
}
