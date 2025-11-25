import {
  useEZOutputOverviewStore,
  useEZOutputEmissionsStore,
  useEZOutputPeopleResponseStore,
  useEZOutputTripLegsStore,
  useEZOutputMapReadyStore,
} from '~stores/output';
import { decodeProgressAlert } from '../../progress';
import type { SSEMessage, SimulationStreamConfig } from './types';
import { TIMELINE_EVENTS } from './constants';
import { decodeSSEMessage } from './decoder';

// === PROGRESS ALERT HANDLER ===

// Handles lifecycle events, timeline events, and map ready signals
function handleProgressAlertMessage(
  messageType: string,
  payload: SSEMessage['payload'],
  config: SimulationStreamConfig
): void {
  // Route to progress decoder for timeline events
  if (TIMELINE_EVENTS.includes(messageType)) {
    decodeProgressAlert(messageType);
    if (config.onTimelineEvent) {
      config.onTimelineEvent(messageType);
    }
    return;
  }

  // Handle lifecycle events
  switch (messageType) {
    case 'started':
      if (config.onStarted && 'requestId' in payload) {
        config.onStarted((payload as { requestId: string }).requestId);
      }
      break;

    case 'heartbeat':
      break;

    case 'complete':
      if (config.onComplete) {
        config.onComplete();
      }
      break;

    case 'error':
      if (config.onError) {
        const errorPayload = payload as { code: string; message: string; details?: string };
        config.onError({
          code: errorPayload.code || 'UNKNOWN',
          message: errorPayload.message || 'An unknown error occurred',
          details: errorPayload.details,
        });
      }
      break;

    case 'map_ready_emissions':
      useEZOutputMapReadyStore.getState().setEmissionsMapDataReady(true);
      break;

    case 'map_ready_people_response':
      useEZOutputMapReadyStore.getState().setPeopleResponseMapDataReady(true);
      break;

    case 'map_ready_trip_legs':
      useEZOutputMapReadyStore.getState().setTripLegsMapDataReady(true);
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
    case 'data_overview': {
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

    case 'data_emissions_paragraph1': {
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

    case 'data_emissions_paragraph2': {
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

    case 'data_emissions_bar_chart': {
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

    case 'data_emissions_pie_charts': {
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

    case 'data_people_response_paragraph1': {
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

    case 'data_people_response_paragraph2': {
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

    case 'data_people_response_breakdown': {
      const data = payload as { data: number[] };
      useEZOutputPeopleResponseStore.getState().setPeopleResponseBreakdownChartData({
        responsePercentages: data.data,
      });
      break;
    }

    case 'data_people_response_time_impact': {
      const data = payload as { data: number[] };
      useEZOutputPeopleResponseStore.getState().setPeopleResponseTimeImpactChartData({
        averageTimeDeltas: data.data,
      });
      break;
    }

    case 'data_trip_legs_first_page': {
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
