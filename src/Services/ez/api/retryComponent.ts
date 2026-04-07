import axios from 'axios';
import {
  useEZOutputOverviewStore,
  useEZOutputEmissionsStore,
  useEZOutputPeopleResponseStore,
  useEZOutputTripLegsStore,
} from '~stores/output';
import { getBackendUrl } from './config';
import { ApiResponse } from './apiResponse';
import { handleDataMessage } from './sse/handlers';

const RETRY_TIMEOUT_MS = 10000;

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
  chart_line_emissions: () => {
    useEZOutputEmissionsStore.getState().setEmissionsLineChartState('loading');
    useEZOutputEmissionsStore.getState().setEmissionsLineChartError(null);
  },
  chart_stacked_bar_emissions: () => {
    useEZOutputEmissionsStore.getState().setEmissionsStackedBarState('loading');
    useEZOutputEmissionsStore.getState().setEmissionsStackedBarError(null);
  },
  warm_cold_intensity_emissions: () => {
    useEZOutputEmissionsStore.getState().setEmissionsWarmColdIntensityState('loading');
    useEZOutputEmissionsStore.getState().setEmissionsWarmColdIntensityError(null);
  },
  text_paragraph1_people_response: () => {
    useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraphState('loading');
    useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraphError(null);
  },
  chart_sankey_people_response: () => {
    useEZOutputPeopleResponseStore.getState().setPeopleResponseSankeyState('loading');
    useEZOutputPeopleResponseStore.getState().setPeopleResponseSankeyError(null);
  },
  text_paragraph1_trip_legs: () => {
    useEZOutputTripLegsStore.getState().setTripLegsParagraphState('loading');
    useEZOutputTripLegsStore.getState().setTripLegsParagraphError(null);
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
  chart_line_emissions: (msg) => {
    useEZOutputEmissionsStore.getState().setEmissionsLineChartState('error');
    useEZOutputEmissionsStore.getState().setEmissionsLineChartError(msg);
  },
  chart_stacked_bar_emissions: (msg) => {
    useEZOutputEmissionsStore.getState().setEmissionsStackedBarState('error');
    useEZOutputEmissionsStore.getState().setEmissionsStackedBarError(msg);
  },
  warm_cold_intensity_emissions: (msg) => {
    useEZOutputEmissionsStore.getState().setEmissionsWarmColdIntensityState('error');
    useEZOutputEmissionsStore.getState().setEmissionsWarmColdIntensityError(msg);
  },
  text_paragraph1_people_response: (msg) => {
    useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraphState('error');
    useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraphError(msg);
  },
  chart_sankey_people_response: (msg) => {
    useEZOutputPeopleResponseStore.getState().setPeopleResponseSankeyState('error');
    useEZOutputPeopleResponseStore.getState().setPeopleResponseSankeyError(msg);
  },
  text_paragraph1_trip_legs: (msg) => {
    useEZOutputTripLegsStore.getState().setTripLegsParagraphState('error');
    useEZOutputTripLegsStore.getState().setTripLegsParagraphError(msg);
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
      { timeout: RETRY_TIMEOUT_MS }
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
