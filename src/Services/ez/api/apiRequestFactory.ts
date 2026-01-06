import { APIPayload, Coordinate, CarDistribution } from '~stores/types';
import { useEZSessionStore } from '~stores/session';

export interface APIRequest {
  scenarioTitle: string;
  scenarioDescription?: string;
  zones: {
    id: string;
    coords: Coordinate[][];
    trip: string[];
    policies: Array<{
      vehicleType: 'zeroEmission' | 'nearZeroEmission' | 'lowEmission' | 'midEmission' | 'highEmission';
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
    nearZeroEmission: number;
    lowEmission: number;
    midEmission: number;
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
  const sessionStore = useEZSessionStore.getState();

  // Filter carDistribution - only include enabled categories
  const enabledDistribution: Partial<CarDistribution> = {};
  let totalPercentage = 0;

  Object.entries(payload.carDistribution).forEach(([key, value]) => {
    if (sessionStore.carDistributionCategories[key]) {
      enabledDistribution[key] = value;
      totalPercentage += value;
    }
  });

  // Normalize to ensure 100% (handle rounding)
  if (totalPercentage > 0 && Math.abs(totalPercentage - 100) > 0.01) {
    const scale = 100 / totalPercentage;
    Object.keys(enabledDistribution).forEach(key => {
      enabledDistribution[key] = Math.round(enabledDistribution[key]! * scale);
    });
  }

  const scaledCoords: Coordinate[][][] = payload.scaledSimulationAreas
    .filter(area => area.coords && area.coords.length > 0)
    .map(area => area.coords);

  const customCoords: Coordinate[][][] = payload.customSimulationAreas
    .filter(area => area.coords !== null && area.coords.length > 0)
    .map(area => area.coords!);

  const simulationArea: Coordinate[][] = [...scaledCoords, ...customCoords].flat();

  const zonesWithCoords = payload.zones.filter(zone => zone.coords !== null);

  // Filter zones - remove policies for disabled vehicle types
  const filteredZones = zonesWithCoords.map(zone => ({
    id: zone.id,
    coords: zone.coords!,
    trip: zone.trip,
    policies: zone.policies.filter(policy => {
      return sessionStore.carDistributionCategories[policy.vehicleType];
    })
  }));

  return {
    scenarioTitle,
    scenarioDescription,
    zones: filteredZones,
    simulationArea,
    sources: payload.sources,
    simulationOptions: payload.simulationOptions,
    carDistribution: enabledDistribution as CarDistribution,
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

  // Check that all carDistribution values sum to 100%
  const total = Object.values(request.carDistribution).reduce((sum, value) => sum + value, 0);
  if (Math.abs(total - 100) > 0.01) {
    return {
      isValid: false,
      error: `Car distribution must sum to 100% (currently ${total}%)`
    };
  }

  // Check that at least one category is enabled
  const sessionStore = useEZSessionStore.getState();
  const enabledCategories = Object.entries(request.carDistribution).filter(([key]) =>
    sessionStore.carDistributionCategories[key]
  );

  if (enabledCategories.length === 0) {
    return {
      isValid: false,
      error: 'At least one emission category must be enabled'
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
