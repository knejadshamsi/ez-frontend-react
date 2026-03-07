import axios from 'axios';
import { getBackendUrl } from './config';
import { ApiResponse, unwrapResponse } from './apiResponse';

const STATUS_CHECK_TIMEOUT_MS = 10000;

interface ScenarioStatusResponse {
  status: string;
  progress: string | null;
}

export const fetchScenarioStatus = async (
  requestId: string
): Promise<ScenarioStatusResponse> => {
  const backendUrl = getBackendUrl();
  const response = await axios.get<ApiResponse<ScenarioStatusResponse>>(
    `${backendUrl}/scenario/${requestId}/status`,
    { timeout: STATUS_CHECK_TIMEOUT_MS }
  );
  return unwrapResponse(response);
};

const TERMINAL_STATUSES = ['COMPLETED', 'CANCELLED', 'FAILED', 'DELETED'];

export const isTerminalStatus = (status: string): boolean => {
  return TERMINAL_STATUSES.includes(status);
};
