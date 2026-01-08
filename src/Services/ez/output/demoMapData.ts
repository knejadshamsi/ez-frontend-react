import { randomPoint } from '@turf/random';
import bbox from '@turf/bbox';
import { polygon, featureCollection } from '@turf/helpers';
import type { BBox } from 'geojson';
import { useAPIPayloadStore } from '~store';
import { useEZOutputMapStore } from '~stores/output';
import type {
  EmissionsMapData,
  PeopleResponseMapData,
  MapPointData,
  MapPathData,
  OutputComponentState,
} from '~stores/output';

const DEMO_CONFIG = {
  pointsPerCategory: 150,
  defaultBbox: [-73.65, 45.45, -73.50, 45.55] as BBox,
  networkDelayMs: 2000,
  weight: { min: 1, max: 11 },
  waypoints: { min: 3, max: 6 },
  co2Delta: { bias: -0.3, range: 500 },
  timeDelta: { bias: -0.2, range: 20 },
  responseTypeMultipliers: {
    paidPenalty: 1.0,
    rerouted: 1.0,
    switchedToBus: 0.5,
    switchedToSubway: 0.4,
    switchedToWalking: 0.3,
    switchedToBiking: 0.2,
    cancelledTrip: 0.3,
  },
  tripImpacts: [
    'Car → Bus',
    'Car → Subway',
    'Car → Walking',
    'Car → Biking',
    'Rerouted',
    'Paid Penalty',
  ],
} as const;

const computeZonesBoundingBox = (): BBox => {
  const zones = useAPIPayloadStore.getState().payload.zones;
  const zonesWithCoords = zones.filter(z => z.coords && z.coords.length > 0);

  if (zonesWithCoords.length === 0) {
    return DEMO_CONFIG.defaultBbox;
  }

  const polygons = zonesWithCoords.map(zone => {
    const coords = zone.coords.map(ring => {
      const closed = [...ring];
      if (ring.length > 0 && (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])) {
        closed.push(ring[0]);
      }
      return closed;
    });
    return polygon(coords);
  });

  const collection = featureCollection(polygons);
  return bbox(collection) as BBox;
};

const generateRandomPoints = (count: number, bounds: BBox): MapPointData[] => {
  const points = randomPoint(count, { bbox: bounds });
  const { min, max } = DEMO_CONFIG.weight;

  return points.features.map(feature => ({
    position: feature.geometry.coordinates as [number, number],
    weight: Math.random() * (max - min) + min,
  }));
};

const generateRandomPaths = (count: number, bounds: BBox): MapPathData[] => {
  const paths: MapPathData[] = [];
  const { min, max } = DEMO_CONFIG.waypoints;
  const { bias: co2Bias, range: co2Range } = DEMO_CONFIG.co2Delta;
  const { bias: timeBias, range: timeRange } = DEMO_CONFIG.timeDelta;

  for (let i = 0; i < count; i++) {
    const waypointCount = Math.floor(Math.random() * (max - min + 1)) + min;
    const waypoints = generateRandomPoints(waypointCount, bounds);

    paths.push({
      id: `leg_${(i + 1).toString().padStart(5, '0')}`,
      path: waypoints.map(p => p.position),
      co2Delta: Math.round((Math.random() + co2Bias) * co2Range),
      timeDelta: Math.round((Math.random() + timeBias) * timeRange),
      impact: DEMO_CONFIG.tripImpacts[Math.floor(Math.random() * DEMO_CONFIG.tripImpacts.length)],
    });
  }

  return paths;
};

export const generateDemoEmissionsMapData = (): EmissionsMapData => {
  const bounds = computeZonesBoundingBox();

  return {
    CO2: generateRandomPoints(DEMO_CONFIG.pointsPerCategory, bounds),
    NOx: generateRandomPoints(DEMO_CONFIG.pointsPerCategory, bounds),
    'PM2.5': generateRandomPoints(DEMO_CONFIG.pointsPerCategory, bounds),
    PM10: generateRandomPoints(DEMO_CONFIG.pointsPerCategory, bounds),
  };
};

export const generateDemoPeopleResponseMapData = (): PeopleResponseMapData => {
  const bounds = computeZonesBoundingBox();

  const mult = DEMO_CONFIG.responseTypeMultipliers;
  const base = DEMO_CONFIG.pointsPerCategory;

  const generateViewData = () => ({
    paidPenalty: generateRandomPoints(Math.floor(base * mult.paidPenalty), bounds),
    rerouted: generateRandomPoints(Math.floor(base * mult.rerouted), bounds),
    switchedToBus: generateRandomPoints(Math.floor(base * mult.switchedToBus), bounds),
    switchedToSubway: generateRandomPoints(Math.floor(base * mult.switchedToSubway), bounds),
    switchedToWalking: generateRandomPoints(Math.floor(base * mult.switchedToWalking), bounds),
    switchedToBiking: generateRandomPoints(Math.floor(base * mult.switchedToBiking), bounds),
    cancelledTrip: generateRandomPoints(Math.floor(base * mult.cancelledTrip), bounds),
  });

  return {
    origin: generateViewData(),
    destination: generateViewData(),
  };
};

export const generateDemoTripLegsMapData = (): MapPathData[] => {
  const bounds = computeZonesBoundingBox();
  return generateRandomPaths(10, bounds);
};

type MapType = 'emissions' | 'peopleResponse' | 'tripLegs';

const loadMapDataWithDelay = <T>(
  mapType: MapType,
  dataGetter: () => T | T[],
  setState: (state: OutputComponentState) => void,
  setData: (data: T) => void,
  generator: () => T
): void => {
  const data = dataGetter();
  const hasData = Array.isArray(data) ? data.length > 0 : !!data;

  if (hasData) return;

  setState('loading');
  setTimeout(() => {
    setData(generator());
    setState('success');
  }, DEMO_CONFIG.networkDelayMs);
};

export const loadDemoMapData = (mapType: MapType): void => {
  const store = useEZOutputMapStore.getState();

  switch (mapType) {
    case 'emissions':
      loadMapDataWithDelay(
        'emissions',
        () => store.emissionsMapData,
        store.setEmissionsMapState,
        store.setEmissionsMapData,
        generateDemoEmissionsMapData
      );
      break;

    case 'peopleResponse':
      loadMapDataWithDelay(
        'peopleResponse',
        () => store.peopleResponseMapData,
        store.setPeopleResponseMapState,
        store.setPeopleResponseMapData,
        generateDemoPeopleResponseMapData
      );
      break;

    case 'tripLegs':
      loadMapDataWithDelay<MapPathData[]>(
        'tripLegs',
        () => store.tripLegsMapData,
        store.setTripLegsMapState,
        store.setTripLegsMapData,
        generateDemoTripLegsMapData
      );
      break;
  }
};
