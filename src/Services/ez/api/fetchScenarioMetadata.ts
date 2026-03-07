import axios from 'axios';
import { getBackendUrl } from './config';
import { ScenarioMetadata } from '~stores/types';
import { ApiResponse, unwrapResponse } from './apiResponse';

const REQUEST_TIMEOUT_MS = 10000;

export const fetchScenarioMetadata = async (
  requestId: string
): Promise<ScenarioMetadata> => {
  const backendUrl = getBackendUrl();
  const url = `${backendUrl}/scenario/${requestId}/input/metadata`;

  const response = await axios.get<ApiResponse<ScenarioMetadata>>(url, { timeout: REQUEST_TIMEOUT_MS });
  return unwrapResponse(response);
};
