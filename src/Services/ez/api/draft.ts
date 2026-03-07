import axios from 'axios';
import { getBackendUrl } from './config';
import type { MainInputPayload, ScenarioMetadata } from '~stores/types';
import { ApiResponse, unwrapResponse } from './apiResponse';

const REQUEST_TIMEOUT_MS = 10000;

interface DraftPayload {
  inputData: MainInputPayload;
  sessionData: ScenarioMetadata;
}

interface DraftCreateResponse {
  requestId: string;
}

const stripDraftPrefix = (draftId: string): string =>
  draftId.startsWith('d_') ? draftId.slice(2) : draftId;

export const createDraft = async (
  input: MainInputPayload,
  session: ScenarioMetadata
): Promise<string> => {
  const backendUrl = getBackendUrl();
  const response = await axios.post<ApiResponse<DraftCreateResponse>>(
    `${backendUrl}/draft`,
    { inputData: input, sessionData: session },
    { timeout: REQUEST_TIMEOUT_MS }
  );
  const data = unwrapResponse(response);
  return `d_${data.requestId}`;
};

export const fetchDraft = async (
  draftId: string
): Promise<DraftPayload> => {
  const uuid = stripDraftPrefix(draftId);
  const backendUrl = getBackendUrl();
  const response = await axios.get<ApiResponse<DraftPayload>>(
    `${backendUrl}/draft/${uuid}`,
    { timeout: REQUEST_TIMEOUT_MS }
  );
  return unwrapResponse(response);
};

export const updateDraft = async (
  draftId: string,
  input: MainInputPayload,
  session: ScenarioMetadata
): Promise<void> => {
  const uuid = stripDraftPrefix(draftId);
  const backendUrl = getBackendUrl();
  await axios.put(
    `${backendUrl}/draft/${uuid}`,
    { inputData: input, sessionData: session },
    { timeout: REQUEST_TIMEOUT_MS }
  );
};

export const deleteDraft = async (
  draftId: string
): Promise<void> => {
  const uuid = stripDraftPrefix(draftId);
  const backendUrl = getBackendUrl();
  await axios.delete(`${backendUrl}/draft/${uuid}`, { timeout: REQUEST_TIMEOUT_MS });
};
