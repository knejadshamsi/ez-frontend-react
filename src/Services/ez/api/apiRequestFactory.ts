import { APIPayload, Coordinate } from '~stores/types';

export interface APIRequest {
  scenarioTitle: string;
  scenarioDescription?: string;
  zones: {
    id: string;
    coords: Coordinate[][];
    trip: string[];
    policies: Array<{
      vehicleType: 'zero_emission' | 'low_emission' | 'high_emission';
      tier: 1 | 2 | 3;
      period: [string, string];
      penalty?: number;
      interval?: number;
    }>;
  }[];
  simulationArea: Coordinate[][];
  sources: {
    population: { year: number; name: string };
    network: { year: number; name: string };
    publicTransport: { year: number; name: string };
  };
  simulationOptions: {
    iterations: number;
    percentage: number;
  };
  carDistribution: {
    zeroEmission: number;
    lowEmission: number;
    highEmission: number;
  };
  modeUtilities: {
    walk: number;
    bike: number;
    car: number;
    ev: number;
    subway: number;
    bus: number;
  };
}

export const createAPIRequest = (
  payload: APIPayload,
  scenarioTitle: string,
  scenarioDescription?: string
): APIRequest => {
  const scaledCoords: Coordinate[][][] = payload.scaledSimulationAreas
    .filter(area => area.coords && area.coords.length > 0)
    .map(area => area.coords);

  const customCoords: Coordinate[][][] = payload.customSimulationAreas
    .filter(area => area.coords !== null && area.coords.length > 0)
    .map(area => area.coords!);

  const simulationArea: Coordinate[][] = [...scaledCoords, ...customCoords].flat();

  const zonesWithCoords = payload.zones.filter(zone => zone.coords !== null);

  return {
    scenarioTitle,
    scenarioDescription,
    zones: zonesWithCoords.map(zone => ({
      id: zone.id,
      coords: zone.coords!,
      trip: zone.trip,
      policies: zone.policies
    })),
    simulationArea,
    sources: payload.sources,
    simulationOptions: payload.simulationOptions,
    carDistribution: payload.carDistribution,
    modeUtilities: payload.modeUtilities
  };
};

export const validateAPIRequest = (request: APIRequest): { isValid: boolean; error?: string } => {
  if (request.zones.length === 0) {
    return {
      isValid: false,
      error: 'At least one emission zone with coordinates must be selected'
    };
  }

  const hasInvalidZone = request.zones.some(zone => !zone.coords || zone.coords.length === 0);
  if (hasInvalidZone) {
    return {
      isValid: false,
      error: 'All zones must have valid coordinates'
    };
  }

  const { zeroEmission, lowEmission, highEmission } = request.carDistribution;
  const total = zeroEmission + lowEmission + highEmission;
  if (Math.abs(total - 100) > 0.01) {
    return {
      isValid: false,
      error: `Car distribution must sum to 100% (currently ${total}%)`
    };
  }

  if (request.simulationOptions.iterations < 1 || request.simulationOptions.iterations > 10) {
    return {
      isValid: false,
      error: 'Simulation iterations must be between 1 and 10'
    };
  }

  if (request.simulationOptions.percentage < 1 || request.simulationOptions.percentage > 10) {
    return {
      isValid: false,
      error: 'Simulation percentage must be between 1 and 10'
    };
  }

  return { isValid: true };
};
