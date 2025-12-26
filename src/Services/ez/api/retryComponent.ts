import {
  useEZOutputOverviewStore,
  useEZOutputEmissionsStore,
  useEZOutputPeopleResponseStore,
} from '~stores/output';

/**
 * Centralized retry function for SSE component data.
 * POSTs to /{requestId}/retry and manages component state via switch case.
 */
export async function retryComponentData(
  requestId: string,
  messageType: string
): Promise<void> {
  // Set loading state and clear error based on message type
  switch (messageType) {
    case 'text_overview':
      useEZOutputOverviewStore.getState().setOverviewState('loading');
      useEZOutputOverviewStore.getState().setOverviewError(null);
      break;

    case 'text_paragraph1_emissions':
      useEZOutputEmissionsStore.getState().setEmissionsParagraph1State('loading');
      useEZOutputEmissionsStore.getState().setEmissionsParagraph1Error(null);
      break;

    case 'text_paragraph2_emissions':
      useEZOutputEmissionsStore.getState().setEmissionsParagraph2State('loading');
      useEZOutputEmissionsStore.getState().setEmissionsParagraph2Error(null);
      break;

    case 'chart_bar_emissions':
      useEZOutputEmissionsStore.getState().setEmissionsBarChartState('loading');
      useEZOutputEmissionsStore.getState().setEmissionsBarChartError(null);
      break;

    case 'chart_pie_emissions':
      useEZOutputEmissionsStore.getState().setEmissionsPieChartsState('loading');
      useEZOutputEmissionsStore.getState().setEmissionsPieChartsError(null);
      break;

    case 'text_paragraph1_people_response':
      useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraph1State('loading');
      useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraph1Error(null);
      break;

    case 'text_paragraph2_people_response':
      useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraph2State('loading');
      useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraph2Error(null);
      break;

    case 'chart_breakdown_people_response':
      useEZOutputPeopleResponseStore.getState().setPeopleResponseBreakdownChartState('loading');
      useEZOutputPeopleResponseStore.getState().setPeopleResponseBreakdownChartError(null);
      break;

    case 'chart_time_impact_people_response':
      useEZOutputPeopleResponseStore.getState().setPeopleResponseTimeImpactChartState('loading');
      useEZOutputPeopleResponseStore.getState().setPeopleResponseTimeImpactChartError(null);
      break;

    default:
      console.warn(`[Retry] Unknown message type: ${messageType}`);
      throw new Error(`Unknown message type: ${messageType}`);
  }

  // POST to retry endpoint
  try {
    const response = await fetch(`/${requestId}/retry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messageType }),
    });

    if (!response.ok) {
      throw new Error(`Retry request failed: ${response.status} ${response.statusText}`);
    }

    // Success: SSE handler will update state to 'success' when data arrives
    // No need to set state here
  } catch (error) {
    // Set error state based on message type
    const errorMessage = error instanceof Error ? error.message : 'Failed to retry component';

    switch (messageType) {
      case 'text_overview':
        useEZOutputOverviewStore.getState().setOverviewState('error');
        useEZOutputOverviewStore.getState().setOverviewError(errorMessage);
        break;

      case 'text_paragraph1_emissions':
        useEZOutputEmissionsStore.getState().setEmissionsParagraph1State('error');
        useEZOutputEmissionsStore.getState().setEmissionsParagraph1Error(errorMessage);
        break;

      case 'text_paragraph2_emissions':
        useEZOutputEmissionsStore.getState().setEmissionsParagraph2State('error');
        useEZOutputEmissionsStore.getState().setEmissionsParagraph2Error(errorMessage);
        break;

      case 'chart_bar_emissions':
        useEZOutputEmissionsStore.getState().setEmissionsBarChartState('error');
        useEZOutputEmissionsStore.getState().setEmissionsBarChartError(errorMessage);
        break;

      case 'chart_pie_emissions':
        useEZOutputEmissionsStore.getState().setEmissionsPieChartsState('error');
        useEZOutputEmissionsStore.getState().setEmissionsPieChartsError(errorMessage);
        break;

      case 'text_paragraph1_people_response':
        useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraph1State('error');
        useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraph1Error(errorMessage);
        break;

      case 'text_paragraph2_people_response':
        useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraph2State('error');
        useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraph2Error(errorMessage);
        break;

      case 'chart_breakdown_people_response':
        useEZOutputPeopleResponseStore.getState().setPeopleResponseBreakdownChartState('error');
        useEZOutputPeopleResponseStore.getState().setPeopleResponseBreakdownChartError(errorMessage);
        break;

      case 'chart_time_impact_people_response':
        useEZOutputPeopleResponseStore.getState().setPeopleResponseTimeImpactChartState('error');
        useEZOutputPeopleResponseStore.getState().setPeopleResponseTimeImpactChartError(errorMessage);
        break;
    }

    throw error;
  }
}
