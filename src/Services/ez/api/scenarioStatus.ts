import axios from 'axios';
import { getBackendUrl } from './config';
import { ApiResponse, unwrapResponse } from './apiResponse';

export interface ScenarioStatusResponse {
  status: string;
  progress: string | null;
}

export const fetchScenarioStatus = async (
  requestId: string
): Promise<ScenarioStatusResponse> => {
  const backendUrl = getBackendUrl();
  const response = await axios.get<ApiResponse<ScenarioStatusResponse>>(
    `${backendUrl}/scenario/${requestId}/status`,
    { timeout: 10000 }
  );
  return unwrapResponse(response);
};

const TERMINAL_STATUSES = ['COMPLETED', 'CANCELLED', 'FAILED', 'DELETED'];

export const isTerminalStatus = (status: string): boolean => {
  return TERMINAL_STATUSES.includes(status);
};
