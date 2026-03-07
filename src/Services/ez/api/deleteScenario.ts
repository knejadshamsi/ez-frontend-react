import axios from 'axios';
import { getBackendUrl } from './config';
import { ApiResponse } from './apiResponse';

const DELETE_TIMEOUT_MS = 35000;

export const deleteScenario = async (requestId: string): Promise<void> => {
  const backendUrl = getBackendUrl();
  const url = `${backendUrl}/scenario/${requestId}`;

  const response = await axios.delete<ApiResponse<void>>(url, { timeout: DELETE_TIMEOUT_MS });

  if (response.data.statusCode !== 200) {
    throw new Error(`Delete failed: ${response.data.message}`);
  }
};
