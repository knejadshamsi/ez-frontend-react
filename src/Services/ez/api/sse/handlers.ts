import {
  useEZOutputOverviewStore,
  useEZOutputEmissionsStore,
  useEZOutputPeopleResponseStore,
  useEZOutputTripLegsStore,
  useEZOutputMapStore,
} from '~stores/output';
import { decodeProgressAlert } from '../../progress';
import type { SSEMessage, SimulationStreamConfig } from './types';
import { decodeSSEMessage } from './decoder';
import type { OutputComponentState } from '~stores/output/types';
import { useScenarioSnapshotStore } from '~stores/scenario';
import type { ScenarioStatus } from '~stores/scenario';
import type { MainInputPayload, ScenarioMetadata } from '~stores/types';

// === ERROR HANDLER CONFIGURATION ===

type ErrorHandlerConfig = {
  setState: (state: OutputComponentState) => void;
  setError: (error: string | null) => void;
};

// Configuration map for SSE component error handlers
const ERROR_HANDLER_MAP: Record<string, ErrorHandlerConfig> = {
  error_text_overview: {
    setState: (state) => useEZOutputOverviewStore.getState().setOverviewState(state),
    setError: (error) => useEZOutputOverviewStore.getState().setOverviewError(error),
  },
  error_text_paragraph1_emissions: {
    setState: (state) => useEZOutputEmissionsStore.getState().setEmissionsParagraph1State(state),
    setError: (error) => useEZOutputEmissionsStore.getState().setEmissionsParagraph1Error(error),
  },
  error_text_paragraph2_emissions: {
    setState: (state) => useEZOutputEmissionsStore.getState().setEmissionsParagraph2State(state),
    setError: (error) => useEZOutputEmissionsStore.getState().setEmissionsParagraph2Error(error),
  },
  error_chart_bar_emissions: {
    setState: (state) => useEZOutputEmissionsStore.getState().setEmissionsBarChartState(state),
    setError: (error) => useEZOutputEmissionsStore.getState().setEmissionsBarChartError(error),
  },
  error_chart_line_emissions: {
    setState: (state) => useEZOutputEmissionsStore.getState().setEmissionsLineChartState(state),
    setError: (error) => useEZOutputEmissionsStore.getState().setEmissionsLineChartError(error),
  },
  error_chart_stacked_bar_emissions: {
    setState: (state) => useEZOutputEmissionsStore.getState().setEmissionsStackedBarState(state),
    setError: (error) => useEZOutputEmissionsStore.getState().setEmissionsStackedBarError(error),
  },
  error_warm_cold_intensity_emissions: {
    setState: (state) => useEZOutputEmissionsStore.getState().setEmissionsWarmColdIntensityState(state),
    setError: (error) => useEZOutputEmissionsStore.getState().setEmissionsWarmColdIntensityError(error),
  },
  error_text_paragraph1_people_response: {
    setState: (state) => useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraphState(state),
    setError: (error) => useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraphError(error),
  },
  error_chart_sankey_people_response: {
    setState: (state) => useEZOutputPeopleResponseStore.getState().setPeopleResponseSankeyState(state),
    setError: (error) => useEZOutputPeopleResponseStore.getState().setPeopleResponseSankeyError(error),
  },
  error_chart_bar_people_response: {
    setState: (state) => useEZOutputPeopleResponseStore.getState().setPeopleResponseBarState(state),
    setError: (error) => useEZOutputPeopleResponseStore.getState().setPeopleResponseBarError(error),
  },
  error_text_paragraph1_trip_legs: {
    setState: (state) => useEZOutputTripLegsStore.getState().setTripLegsParagraphState(state),
    setError: (error) => useEZOutputTripLegsStore.getState().setTripLegsParagraphError(error),
  },
  error_table_trip_legs: {
    setState: (state) => useEZOutputTripLegsStore.getState().setTripLegsTableState(state),
    setError: (error) => useEZOutputTripLegsStore.getState().setTripLegsTableError(error),
  },
};

// === PROGRESS ALERT HANDLER ===

// Handles lifecycle events, timeline events, and map ready signals
function handleProgressAlertMessage(
  messageType: string,
  payload: SSEMessage['payload'],
  config: SimulationStreamConfig
): void {
  // Handle lifecycle events first (before phase routing)
  // pa_simulation_start would otherwise match the pa_simulation_* phase prefix
  switch (messageType) {
    case 'pa_request_accepted': {
      const requestId = (payload as { requestId?: string }).requestId;
      if (config.onStarted && requestId && requestId.trim() !== '') {
        config.onStarted(requestId);
      }
      break;
    }

    case 'pa_simulation_start':
      if (config.onSimulationStart) {
        config.onSimulationStart();
      }
      break;

    case 'pa_cancelled_process': {
      const cancelData = payload as { status: string; reason: string };
      if (config.onCancelled) {
        config.onCancelled(cancelData.reason);
      }
      break;
    }

    case 'heartbeat':
      break;

    case 'success_process':
      if (config.onComplete) {
        config.onComplete();
      }
      break;

    case 'error_global':
      if (config.onError) {
        const errorPayload = payload as { code: string; message: string; details?: string };
        config.onError({
          code: errorPayload.code || 'UNKNOWN',
          message: errorPayload.message || 'An unknown error occurred',
          details: errorPayload.details,
        });
      }
      break;

    case 'error_validation': {
      const validationPayload = payload as { errors: Array<{ origin: string; error: string; message: string }> };
      if (config.onValidationError) {
        config.onValidationError(validationPayload.errors);
      }
      break;
    }

    case 'success_map_emissions':
      useEZOutputMapStore.getState().setEmissionsMapState('success_initial');
      break;

    case 'success_map_people_response':
      useEZOutputMapStore.getState().setPeopleResponseMapState('success_initial');
      break;

    case 'success_map_trip_legs':
      useEZOutputMapStore.getState().setTripLegsMapState('success_initial');
      break;

    case 'error_map_emissions': {
      const errorData = payload as { message: string };
      useEZOutputMapStore.getState().setEmissionsMapState('error_initial');
      useEZOutputMapStore.getState().setEmissionsMapError(errorData.message);
      break;
    }

    case 'error_map_people_response': {
      const errorData = payload as { message: string };
      useEZOutputMapStore.getState().setPeopleResponseMapState('error_initial');
      useEZOutputMapStore.getState().setPeopleResponseMapError(errorData.message);
      break;
    }

    case 'error_map_trip_legs': {
      const errorData = payload as { message: string };
      useEZOutputMapStore.getState().setTripLegsMapState('error_initial');
      useEZOutputMapStore.getState().setTripLegsMapError(errorData.message);
      break;
    }

    case 'scenario_status': {
      const data = payload as { status: string };
      useScenarioSnapshotStore.getState().setStatus(data.status as ScenarioStatus);
      if (config.onScenarioStatus) {
        config.onScenarioStatus(data.status);
      }
      break;
    }

    case 'scenario_input': {
      useScenarioSnapshotStore.getState().setInput(payload as unknown as MainInputPayload);
      if (config.onScenarioInput) {
        config.onScenarioInput(payload as Record<string, unknown>);
      }
      break;
    }

    case 'scenario_session': {
      useScenarioSnapshotStore.getState().setSession(payload as unknown as ScenarioMetadata);
      if (config.onScenarioSession) {
        config.onScenarioSession(payload as Record<string, unknown>);
      }
      break;
    }

    default: {
      // Route phase progress events to decoder
      const isPhaseEvent = messageType.startsWith('pa_preprocessing_') ||
                           messageType.startsWith('pa_simulation_') ||
                           messageType.startsWith('pa_postprocessing_');

      if (isPhaseEvent) {
        decodeProgressAlert(messageType);
        if (config.onTimelineEvent) {
          config.onTimelineEvent(messageType);
        }
        break;
      }

      // Component-level errors
      if (messageType in ERROR_HANDLER_MAP) {
        const errorData = payload as { message: string };
        const errorHandler = ERROR_HANDLER_MAP[messageType];
        errorHandler.setState('error');
        errorHandler.setError(errorData.message);
        break;
      }

      console.warn(`[SSE] Unhandled progress alert: ${messageType}`);
      break;
    }
  }
}

// === SUCCESS STATE CONFIGURATION ===

// Configuration map for success state setters (called after data is set)
const SUCCESS_STATE_MAP: Record<string, () => void> = {
  data_text_overview: () => useEZOutputOverviewStore.getState().setOverviewState('success'),
  data_text_paragraph1_emissions: () => useEZOutputEmissionsStore.getState().setEmissionsParagraph1State('success'),
  data_text_paragraph2_emissions: () => useEZOutputEmissionsStore.getState().setEmissionsParagraph2State('success'),
  data_chart_bar_emissions: () => useEZOutputEmissionsStore.getState().setEmissionsBarChartState('success'),
  data_chart_line_emissions: () => useEZOutputEmissionsStore.getState().setEmissionsLineChartState('success'),
  data_chart_stacked_bar_emissions: () => useEZOutputEmissionsStore.getState().setEmissionsStackedBarState('success'),
  data_warm_cold_intensity_emissions: () => useEZOutputEmissionsStore.getState().setEmissionsWarmColdIntensityState('success'),
  data_text_paragraph1_people_response: () => useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraphState('success'),
  data_chart_sankey_people_response: () => useEZOutputPeopleResponseStore.getState().setPeopleResponseSankeyState('success'),
  data_chart_bar_people_response: () => useEZOutputPeopleResponseStore.getState().setPeopleResponseBarState('success'),
  data_text_paragraph1_trip_legs: () => useEZOutputTripLegsStore.getState().setTripLegsParagraphState('success'),
  data_table_trip_legs: () => useEZOutputTripLegsStore.getState().setTripLegsTableState('success'),
};

// === DATA MESSAGE HANDLER ===

// Processes data messages and updates output stores
export function handleDataMessage(
  messageType: string,
  payload: SSEMessage['payload']
): void {
  switch (messageType) {
    case 'data_text_overview': {
      const data = payload as {
        personCount: number;
        legCount: number;
        simulationAreaKm2: number;
        networkNodes: number;
        networkLinks: number;
        totalKmTraveled: number;
        samplePersonCount: number;
        sampleLegCount: number;
        sampleTotalKmTraveled: number;
        samplePercentage: number;
      };
      useEZOutputOverviewStore.getState().setOverviewData({
        personCount: data.personCount,
        legCount: data.legCount,
        totalAreaCoverageKm2: data.simulationAreaKm2,
        totalNetworkNodes: data.networkNodes,
        totalNetworkLinks: data.networkLinks,
        totalKmTraveled: data.totalKmTraveled,
        samplePersonCount: data.samplePersonCount,
        sampleLegCount: data.sampleLegCount,
        sampleTotalKmTraveled: data.sampleTotalKmTraveled,
        samplePercentage: data.samplePercentage,
      });
      break;
    }

    case 'data_text_paragraph1_emissions': {
      const data = payload as {
        co2Baseline: number; co2Policy: number; co2DeltaPercent: number;
        noxBaseline: number; noxPolicy: number; noxDeltaPercent: number;
        pm25Baseline: number; pm25Policy: number; pm25DeltaPercent: number;
        pm10Baseline: number; pm10Policy: number; pm10DeltaPercent: number;
        privateCo2Baseline: number; privateCo2Policy: number; privateCo2DeltaPercent: number;
        privateNoxBaseline: number; privateNoxPolicy: number; privateNoxDeltaPercent: number;
        privatePm25Baseline: number; privatePm25Policy: number; privatePm25DeltaPercent: number;
        privatePm10Baseline: number; privatePm10Policy: number; privatePm10DeltaPercent: number;
        transitCo2Baseline: number; transitCo2Policy: number;
        transitNoxBaseline: number; transitNoxPolicy: number;
        transitPm25Baseline: number; transitPm25Policy: number;
        transitPm10Baseline: number; transitPm10Policy: number;
      };
      useEZOutputEmissionsStore.getState().setEmissionsParagraph1Data(data);
      break;
    }

    case 'data_text_paragraph2_emissions': {
      const data = payload as {
        pm25PerKm2Baseline: number;
        pm25PerKm2Policy: number;
        zoneAreaKm2: number;
        mixingHeightMeters: number;
      };
      useEZOutputEmissionsStore.getState().setEmissionsParagraph2Data(data);
      break;
    }

    case 'data_chart_bar_emissions': {
      // Same payload shape as paragraph1
      const data = payload as {
        co2Baseline: number; co2Policy: number; co2DeltaPercent: number;
        noxBaseline: number; noxPolicy: number; noxDeltaPercent: number;
        pm25Baseline: number; pm25Policy: number; pm25DeltaPercent: number;
        pm10Baseline: number; pm10Policy: number; pm10DeltaPercent: number;
        privateCo2Baseline: number; privateCo2Policy: number; privateCo2DeltaPercent: number;
        privateNoxBaseline: number; privateNoxPolicy: number; privateNoxDeltaPercent: number;
        privatePm25Baseline: number; privatePm25Policy: number; privatePm25DeltaPercent: number;
        privatePm10Baseline: number; privatePm10Policy: number; privatePm10DeltaPercent: number;
        transitCo2Baseline: number; transitCo2Policy: number;
        transitNoxBaseline: number; transitNoxPolicy: number;
        transitPm25Baseline: number; transitPm25Policy: number;
        transitPm10Baseline: number; transitPm10Policy: number;
      };
      useEZOutputEmissionsStore.getState().setEmissionsBarChartData(data);
      break;
    }

    case 'data_chart_line_emissions': {
      const data = payload as {
        timeBins: string[];
        co2Baseline: number[]; co2Policy: number[];
        noxBaseline: number[]; noxPolicy: number[];
        pm25Baseline: number[]; pm25Policy: number[];
        pm10Baseline: number[]; pm10Policy: number[];
      };
      useEZOutputEmissionsStore.getState().setEmissionsLineChartData(data);
      break;
    }

    case 'data_chart_stacked_bar_emissions': {
      const data = payload as {
        baseline: {
          private: { co2ByType: Record<string, number>; noxByType: Record<string, number>; pm25ByType: Record<string, number>; pm10ByType: Record<string, number> };
          transit: { co2: number; nox: number; pm25: number; pm10: number };
        };
        policy: {
          private: { co2ByType: Record<string, number>; noxByType: Record<string, number>; pm25ByType: Record<string, number>; pm10ByType: Record<string, number> };
          transit: { co2: number; nox: number; pm25: number; pm10: number };
        };
      };
      useEZOutputEmissionsStore.getState().setEmissionsStackedBarData(data);
      break;
    }

    case 'data_warm_cold_intensity_emissions': {
      const data = payload as {
        warmCold: { warmBaseline: number; coldBaseline: number; warmPolicy: number; coldPolicy: number };
        intensity: { co2Baseline: number; co2Policy: number; distanceBaseline: number; distancePolicy: number; co2PerMeterBaseline: number; co2PerMeterPolicy: number };
      };
      useEZOutputEmissionsStore.getState().setEmissionsWarmColdIntensityData(data);
      break;
    }

    case 'data_text_paragraph1_people_response': {
      const data = payload as {
        totalTrips: number; affectedTrips: number; affectedAgents: number;
        modeShiftCount: number; modeShiftPct: number;
        reroutedCount: number; reroutedPct: number;
        paidPenaltyCount: number; paidPenaltyPct: number;
        cancelledCount: number; cancelledPct: number;
        noChangeCount: number; noChangePct: number;
        dominantResponse: string;
        penaltyCharges: Array<{ zoneName: string; rate: number }>;
      };
      useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraphData(data);
      break;
    }

    case 'data_chart_sankey_people_response': {
      const data = payload as {
        nodes: string[];
        flows: Array<{ from: string; to: string; count: number }>;
      };
      useEZOutputPeopleResponseStore.getState().setPeopleResponseSankeyData(data);
      break;
    }

    case 'data_chart_bar_people_response': {
      const data = payload as {
        modes: string[];
        baseline: number[];
        policy: number[];
      };
      useEZOutputPeopleResponseStore.getState().setPeopleResponseBarData(data);
      break;
    }

    case 'data_text_paragraph1_trip_legs': {
      const data = payload as {
        totalTrips: number; changedTrips: number; unchangedTrips: number;
        cancelledTrips: number; newTrips: number; modeShiftTrips: number;
        netCo2DeltaGrams: number; netTimeDeltaMinutes: number;
        avgCo2DeltaGrams: number; avgTimeDeltaMinutes: number;
        improvedCo2Count: number; worsenedCo2Count: number;
        improvedTimeCount: number; worsenedTimeCount: number;
        winWinCount: number; loseLoseCount: number;
        envWinPersonalCostCount: number; personalWinEnvCostCount: number;
        dominantOutcome: string;
      };
      useEZOutputTripLegsStore.getState().setTripLegsParagraphData(data);
      break;
    }

    case 'data_table_trip_legs': {
      const data = payload as {
        records: Array<{
          legId: string;
          personId: string;
          originActivity: string;
          destinationActivity: string;
          co2DeltaGrams: number;
          timeDeltaMinutes: number;
          impact: string;
        }>;
        totalRecords: number;
        totalAllRecords: number;
        pageSize: number;
      };
      useEZOutputTripLegsStore.getState().setTripLegsFirstPage({
        records: data.records,
        totalRecords: data.totalRecords,
        totalAllRecords: data.totalAllRecords,
        pageSize: data.pageSize,
      });
      break;
    }

    default:
      console.warn(`[SSE] Unhandled data message: ${messageType}`);
      break;
  }

  // Set success state using configuration map (if applicable)
  if (messageType in SUCCESS_STATE_MAP) {
    SUCCESS_STATE_MAP[messageType]();
  }
}

// === MESSAGE ROUTER ===

// Routes incoming SSE messages to appropriate handlers based on category
export function handleSSEMessage(
  message: SSEMessage,
  config: SimulationStreamConfig
): void {
  const { messageType, payload } = message;

  const decoded = decodeSSEMessage(messageType);
  switch (decoded.category) {
    case 'progress_alert':
      handleProgressAlertMessage(messageType, payload, config);
      break;

    case 'data':
      handleDataMessage(messageType, payload);
      break;
  }
}
