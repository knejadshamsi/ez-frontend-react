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
  error_chart_pie_emissions: {
    setState: (state) => useEZOutputEmissionsStore.getState().setEmissionsPieChartsState(state),
    setError: (error) => useEZOutputEmissionsStore.getState().setEmissionsPieChartsError(error),
  },
  error_text_paragraph1_people_response: {
    setState: (state) => useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraph1State(state),
    setError: (error) => useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraph1Error(error),
  },
  error_text_paragraph2_people_response: {
    setState: (state) => useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraph2State(state),
    setError: (error) => useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraph2Error(error),
  },
  error_chart_breakdown_people_response: {
    setState: (state) => useEZOutputPeopleResponseStore.getState().setPeopleResponseBreakdownChartState(state),
    setError: (error) => useEZOutputPeopleResponseStore.getState().setPeopleResponseBreakdownChartError(error),
  },
  error_chart_time_impact_people_response: {
    setState: (state) => useEZOutputPeopleResponseStore.getState().setPeopleResponseTimeImpactChartState(state),
    setError: (error) => useEZOutputPeopleResponseStore.getState().setPeopleResponseTimeImpactChartError(error),
  },
};

// === PROGRESS ALERT HANDLER ===

// Handles lifecycle events, timeline events, and map ready signals
function handleProgressAlertMessage(
  messageType: string,
  payload: SSEMessage['payload'],
  config: SimulationStreamConfig
): void {
  // Route to progress decoder for phase/timeline events
  // Phase events follow pattern: pa_phase_*, success_phase_*, error_phase_*
  const isPhaseEvent = messageType.startsWith('pa_phase_') ||
                       messageType.startsWith('success_phase_') ||
                       messageType.startsWith('error_phase_');

  if (isPhaseEvent) {
    decodeProgressAlert(messageType);
    if (config.onTimelineEvent) {
      config.onTimelineEvent(messageType);
    }
    return;
  }

  // Check if this is a component error that uses the configuration map
  if (messageType in ERROR_HANDLER_MAP) {
    const errorData = payload as { message: string };
    const config = ERROR_HANDLER_MAP[messageType];
    config.setState('error');
    config.setError(errorData.message);
    return;
  }

  // Handle lifecycle events and map-specific events
  switch (messageType) {
    case 'pa_connection':
      if (config.onStarted && 'requestId' in payload) {
        config.onStarted((payload as { requestId: string }).requestId);
      }
      break;

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

    default:
      console.warn(`[SSE] Unhandled progress alert: ${messageType}`);
      break;
  }
}

// === SUCCESS STATE CONFIGURATION ===

// Configuration map for success state setters (called after data is set)
const SUCCESS_STATE_MAP: Record<string, () => void> = {
  data_text_overview: () => useEZOutputOverviewStore.getState().setOverviewState('success'),
  data_text_paragraph1_emissions: () => useEZOutputEmissionsStore.getState().setEmissionsParagraph1State('success'),
  data_text_paragraph2_emissions: () => useEZOutputEmissionsStore.getState().setEmissionsParagraph2State('success'),
  data_chart_bar_emissions: () => useEZOutputEmissionsStore.getState().setEmissionsBarChartState('success'),
  data_chart_pie_emissions: () => useEZOutputEmissionsStore.getState().setEmissionsPieChartsState('success'),
  data_text_paragraph1_people_response: () => useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraph1State('success'),
  data_text_paragraph2_people_response: () => useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraph2State('success'),
  data_chart_breakdown_people_response: () => useEZOutputPeopleResponseStore.getState().setPeopleResponseBreakdownChartState('success'),
  data_chart_time_impact_people_response: () => useEZOutputPeopleResponseStore.getState().setPeopleResponseTimeImpactChartState('success'),
};

// === DATA MESSAGE HANDLER ===

// Processes data messages and updates output stores
function handleDataMessage(
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
      };
      useEZOutputOverviewStore.getState().setOverviewData({
        totalPersonCount: data.personCount,
        totalLegCount: data.legCount,
        totalAreaCoverageKm2: data.simulationAreaKm2,
        totalNetworkNodes: data.networkNodes,
        totalNetworkLinks: data.networkLinks,
        totalKilometersTraveled: data.totalKmTraveled,
      });
      break;
    }

    case 'data_text_paragraph1_emissions': {
      const data = payload as {
        co2Baseline: number;
        co2PostPolicy: number;
        pm25Baseline: number;
        pm25PostPolicy: number;
        noxBaseline: number;
        noxPostPolicy: number;
        pm10Baseline: number;
        pm10PostPolicy: number;
        modeShiftPercentage: number;
      };
      useEZOutputEmissionsStore.getState().setEmissionsParagraph1Data({
        co2Baseline: data.co2Baseline,
        co2PostPolicy: data.co2PostPolicy,
        pm25Baseline: data.pm25Baseline,
        pm25PostPolicy: data.pm25PostPolicy,
        noxBaseline: data.noxBaseline,
        noxPostPolicy: data.noxPostPolicy,
        pm10Baseline: data.pm10Baseline,
        pm10PostPolicy: data.pm10PostPolicy,
        modeShiftPercentage: data.modeShiftPercentage,
      });
      break;
    }

    case 'data_text_paragraph2_emissions': {
      const data = payload as {
        pm25PostPolicy: number;
        zoneArea: number;
        mixingHeight: number;
        evShareBaseline: number;
        evSharePostPolicy: number;
        standardShareBaseline: number;
        standardSharePostPolicy: number;
        heavyShareBaseline: number;
        heavySharePostPolicy: number;
      };
      useEZOutputEmissionsStore.getState().setEmissionsParagraph2Data({
        pm25PostPolicy: data.pm25PostPolicy,
        zoneAreaKm2: data.zoneArea,
        mixingHeightMeters: data.mixingHeight,
        electricVehicleShareBaseline: data.evShareBaseline,
        electricVehicleSharePostPolicy: data.evSharePostPolicy,
        standardVehicleShareBaseline: data.standardShareBaseline,
        standardVehicleSharePostPolicy: data.standardSharePostPolicy,
        heavyVehicleShareBaseline: data.heavyShareBaseline,
        heavyVehicleSharePostPolicy: data.heavySharePostPolicy,
      });
      break;
    }

    case 'data_chart_bar_emissions': {
      const data = payload as {
        baselineData: number[];
        postPolicyData: number[];
      };
      useEZOutputEmissionsStore.getState().setEmissionsBarChartData({
        baselineEmissions: data.baselineData,
        postPolicyEmissions: data.postPolicyData,
      });
      break;
    }

    case 'data_chart_pie_emissions': {
      const data = payload as {
        vehicleBaselineData: number[];
        vehiclePostPolicyData: number[];
      };
      useEZOutputEmissionsStore.getState().setEmissionsPieChartsData({
        vehicleShareBaseline: data.vehicleBaselineData,
        vehicleSharePostPolicy: data.vehiclePostPolicyData,
      });
      break;
    }

    case 'data_text_paragraph1_people_response': {
      const data = payload as {
        paidPenaltyPct: number;
        reroutedPct: number;
        busPct: number;
        subwayPct: number;
        walkPct: number;
        bikePct: number;
        cancelledPct: number;
        penaltyCharge: number;
        totalAffectedTrips: number;
      };
      useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraph1Data({
        paidPenaltyPercentage: data.paidPenaltyPct,
        reroutedPercentage: data.reroutedPct,
        switchedToBusPercentage: data.busPct,
        switchedToSubwayPercentage: data.subwayPct,
        switchedToWalkingPercentage: data.walkPct,
        switchedToBikingPercentage: data.bikePct,
        cancelledTripPercentage: data.cancelledPct,
        penaltyChargeAmount: data.penaltyCharge,
        totalAffectedTrips: data.totalAffectedTrips,
      });
      break;
    }

    case 'data_text_paragraph2_people_response': {
      const data = payload as {
        avgPenaltyTime: number;
        avgRerouteTime: number;
        avgBusTime: number;
        avgSubwayTime: number;
        avgWalkTime: number;
        avgBikeTime: number;
      };
      useEZOutputPeopleResponseStore.getState().setPeopleResponseParagraph2Data({
        averageTimePaidPenalty: data.avgPenaltyTime,
        averageTimeRerouted: data.avgRerouteTime,
        averageTimeSwitchedToBus: data.avgBusTime,
        averageTimeSwitchedToSubway: data.avgSubwayTime,
        averageTimeSwitchedToWalking: data.avgWalkTime,
        averageTimeSwitchedToBiking: data.avgBikeTime,
      });
      break;
    }

    case 'data_chart_breakdown_people_response': {
      const data = payload as { data: number[] };
      useEZOutputPeopleResponseStore.getState().setPeopleResponseBreakdownChartData({
        responsePercentages: data.data,
      });
      break;
    }

    case 'data_chart_time_impact_people_response': {
      const data = payload as { data: number[] };
      useEZOutputPeopleResponseStore.getState().setPeopleResponseTimeImpactChartData({
        averageTimeDeltas: data.data,
      });
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
        pageSize: number;
      };
      useEZOutputTripLegsStore.getState().setTripLegsFirstPage({
        records: data.records,
        totalRecords: data.totalRecords,
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
