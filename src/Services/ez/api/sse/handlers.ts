import {
  useEZOutputOverviewStore,
  useEZOutputEmissionsStore,
  useEZOutputPeopleResponseStore,
  useEZOutputTripLegsStore,
  useEZOutputMapReadyStore,
} from '~stores/output';
import { decodeProgressAlert } from '../../progress';
import type { SSEMessage, SimulationStreamConfig } from './types';
import { decodeSSEMessage } from './decoder';

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

  // Handle lifecycle events
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
      useEZOutputMapReadyStore.getState().setEmissionsMapDataReady(true);
      break;

    case 'success_map_people_response':
      useEZOutputMapReadyStore.getState().setPeopleResponseMapDataReady(true);
      break;

    case 'success_map_trip_legs':
      useEZOutputMapReadyStore.getState().setTripLegsMapDataReady(true);
      break;

    case 'error_map_emissions':
      // TODO: Set error state and ready flag in stores (Phase 4)
      console.warn('[SSE] Emissions map error received');
      break;

    case 'error_map_people_response':
      // TODO: Set error state and ready flag in stores (Phase 4)
      console.warn('[SSE] People response map error received');
      break;

    case 'error_map_trip_legs':
      // TODO: Set error state and ready flag in stores (Phase 4)
      console.warn('[SSE] Trip legs map error received');
      break;

    default:
      console.warn(`[SSE] Unhandled progress alert: ${messageType}`);
      break;
  }
}

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
