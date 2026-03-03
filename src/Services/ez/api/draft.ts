import axios from 'axios';
import { getBackendUrl } from './config';
import type { MainInputPayload, ScenarioMetadata } from '~stores/types';
import { ApiResponse, unwrapResponse } from './apiResponse';

interface DraftPayload {
  inputData: MainInputPayload;
  sessionData: ScenarioMetadata;
}

interface DraftCreateResponse {
  requestId: string;
}

export const createDraft = async (
  input: MainInputPayload,
  session: ScenarioMetadata
): Promise<string> => {
  const backendUrl = getBackendUrl();
  const response = await axios.post<ApiResponse<DraftCreateResponse>>(
    `${backendUrl}/draft`,
    { inputData: input, sessionData: session },
    { timeout: 10000 }
  );
  const data = unwrapResponse(response);
  return `d_${data.requestId}`;
};

export const fetchDraft = async (
  draftId: string
): Promise<DraftPayload> => {
  const uuid = draftId.startsWith('d_') ? draftId.slice(2) : draftId;
  const backendUrl = getBackendUrl();
  const response = await axios.get<ApiResponse<DraftPayload>>(
    `${backendUrl}/draft/${uuid}`,
    { timeout: 10000 }
  );
  return unwrapResponse(response);
};

export const updateDraft = async (
  draftId: string,
  input: MainInputPayload,
  session: ScenarioMetadata
): Promise<void> => {
  const uuid = draftId.startsWith('d_') ? draftId.slice(2) : draftId;
  const backendUrl = getBackendUrl();
  await axios.put(
    `${backendUrl}/draft/${uuid}`,
    { inputData: input, sessionData: session },
    { timeout: 10000 }
  );
};

export const deleteDraft = async (
  draftId: string
): Promise<void> => {
  const uuid = draftId.startsWith('d_') ? draftId.slice(2) : draftId;
  const backendUrl = getBackendUrl();
  await axios.delete(`${backendUrl}/draft/${uuid}`, { timeout: 10000 });
};
