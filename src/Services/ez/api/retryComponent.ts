import axios from 'axios';
import {
  useEZOutputOverviewStore,
  useEZOutputEmissionsStore,
  useEZOutputPeopleResponseStore,
} from '~stores/output';
import { getBackendUrl } from './config';
import { ApiResponse } from './apiResponse';
import { handleDataMessage } from './sse/handlers';

interface RetryPayload {
  messageType: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

// State setter maps to reduce duplication
const LOADING_STATE_MAP: Record<string, () => void> = {
  text_overview: () => {
    useEZOutputOverviewStore.getState().setOverviewState('loading');
    useEZOutputOverviewStore.getState().setOverviewError(null);
  },
  text_paragraph1_emissions: () => {
    useEZOutputEmissionsStore.getState().setEmissionsParagraph1State('loading');
    useEZOutputEmissionsStore.getState().setEmissionsParagraph1Error(null);
  },
  text_paragraph2_emissions: () => {
    useEZOutputEmissionsStore.getState().setEmissionsParagraph2State('loading');
    useEZOutputEmissionsStore.getState().setEmissionsParagraph2Error(null);
  },
  chart_bar_emissions: () => {
    useEZOutputEmissionsStore.getState().setEmissionsBarChartState('loading');
    useEZOutputEmissionsStore.getState().setEmissionsBarChartError(null);
  },
  chart_pie_emissions: () => {
    useEZOutputEmissionsStore.getState().setEmissionsPieChartsState('loading');
    useEZOutputEmissionsStore.getState().setEmissionsPieChartsError(null);
  },
  text_paragraph1_people_response: () => {
    useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraph1State('loading');
    useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraph1Error(null);
  },
  text_paragraph2_people_response: () => {
    useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraph2State('loading');
    useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraph2Error(null);
  },
  chart_breakdown_people_response: () => {
    useEZOutputPeopleResponseStore.getState().setPeopleResponseBreakdownChartState('loading');
    useEZOutputPeopleResponseStore.getState().setPeopleResponseBreakdownChartError(null);
  },
  chart_time_impact_people_response: () => {
    useEZOutputPeopleResponseStore.getState().setPeopleResponseTimeImpactChartState('loading');
    useEZOutputPeopleResponseStore.getState().setPeopleResponseTimeImpactChartError(null);
  },
};

const ERROR_STATE_MAP: Record<string, (msg: string) => void> = {
  text_overview: (msg) => {
    useEZOutputOverviewStore.getState().setOverviewState('error');
    useEZOutputOverviewStore.getState().setOverviewError(msg);
  },
  text_paragraph1_emissions: (msg) => {
    useEZOutputEmissionsStore.getState().setEmissionsParagraph1State('error');
    useEZOutputEmissionsStore.getState().setEmissionsParagraph1Error(msg);
  },
  text_paragraph2_emissions: (msg) => {
    useEZOutputEmissionsStore.getState().setEmissionsParagraph2State('error');
    useEZOutputEmissionsStore.getState().setEmissionsParagraph2Error(msg);
  },
  chart_bar_emissions: (msg) => {
    useEZOutputEmissionsStore.getState().setEmissionsBarChartState('error');
    useEZOutputEmissionsStore.getState().setEmissionsBarChartError(msg);
  },
  chart_pie_emissions: (msg) => {
    useEZOutputEmissionsStore.getState().setEmissionsPieChartsState('error');
    useEZOutputEmissionsStore.getState().setEmissionsPieChartsError(msg);
  },
  text_paragraph1_people_response: (msg) => {
    useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraph1State('error');
    useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraph1Error(msg);
  },
  text_paragraph2_people_response: (msg) => {
    useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraph2State('error');
    useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraph2Error(msg);
  },
  chart_breakdown_people_response: (msg) => {
    useEZOutputPeopleResponseStore.getState().setPeopleResponseBreakdownChartState('error');
    useEZOutputPeopleResponseStore.getState().setPeopleResponseBreakdownChartError(msg);
  },
  chart_time_impact_people_response: (msg) => {
    useEZOutputPeopleResponseStore.getState().setPeopleResponseTimeImpactChartState('error');
    useEZOutputPeopleResponseStore.getState().setPeopleResponseTimeImpactChartError(msg);
  },
};

/**
 * Retries a failed component by requesting cached data from the backend.
 * POSTs to /scenario/{requestId}/retry, parses the REST response,
 * and updates the output store directly via handleDataMessage.
 */
export async function retryComponentData(
  requestId: string,
  messageType: string
): Promise<void> {
  // Set loading state
  const setLoading = LOADING_STATE_MAP[messageType];
  if (!setLoading) {
    console.warn(`[Retry] Unknown message type: ${messageType}`);
    throw new Error(`Unknown message type: ${messageType}`);
  }
  setLoading();

  try {
    const backendUrl = getBackendUrl();
    const response = await axios.post<ApiResponse<RetryPayload>>(
      `${backendUrl}/scenario/${requestId}/retry`,
      { messageType },
      { timeout: 10000 }
    );

    if (response.data.statusCode !== 200) {
      throw new Error(`Retry failed: ${response.data.message}`);
    }

    // Parse the response data and update the store via the shared SSE data handler
    const retryPayload = response.data.payload;
    handleDataMessage(retryPayload.messageType, retryPayload.payload);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to retry component';
    const setError = ERROR_STATE_MAP[messageType];
    if (setError) {
      setError(errorMessage);
    }
    throw error;
  }
}
