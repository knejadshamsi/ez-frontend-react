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
  TripLegsMapData,
  OutputComponentState,
} from '~stores/output';

const DEMO_CONFIG = {
  pointsPerCategory: 150,
  tripLegPaths: 10,
  defaultBbox: [-73.65, 45.45, -73.50, 45.55] as BBox,
  networkDelayMs: 2000,
  weight: { min: 1, max: 11 },
  waypoints: { min: 3, max: 6 },
  co2Delta: { bias: -0.3, range: 500 },
  timeDelta: { bias: -0.2, range: 20 },
  responseTypeMultipliers: {
    modeShift: 1.0,
    rerouted: 0.8,
    paidPenalty: 0.6,
    cancelled: 0.3,
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


const generateDemoEmissionsMapData = (): EmissionsMapData => {
  const bounds = computeZonesBoundingBox();

  const generatePollutantSet = () => ({
    CO2: generateRandomPoints(DEMO_CONFIG.pointsPerCategory, bounds),
    NOx: generateRandomPoints(DEMO_CONFIG.pointsPerCategory, bounds),
    'PM2.5': generateRandomPoints(DEMO_CONFIG.pointsPerCategory, bounds),
    PM10: generateRandomPoints(DEMO_CONFIG.pointsPerCategory, bounds),
  });

  return {
    baseline: generatePollutantSet(),
    policy: generatePollutantSet(),
    privateBaseline: generatePollutantSet(),
    privatePolicy: generatePollutantSet(),
  };
};

const generateDemoPeopleResponseMapData = (): PeopleResponseMapData => {
  const bounds = computeZonesBoundingBox();

  const mult = DEMO_CONFIG.responseTypeMultipliers;
  const base = DEMO_CONFIG.pointsPerCategory;

  const generateViewData = () => ({
    modeShift: generateRandomPoints(Math.floor(base * mult.modeShift), bounds),
    rerouted: generateRandomPoints(Math.floor(base * mult.rerouted), bounds),
    paidPenalty: generateRandomPoints(Math.floor(base * mult.paidPenalty), bounds),
    cancelled: generateRandomPoints(Math.floor(base * mult.cancelled), bounds),
  });

  return {
    origin: generateViewData(),
    destination: generateViewData(),
  };
};

const generateDemoTripLegsMapData = (): TripLegsMapData => {
  const bounds = computeZonesBoundingBox();
  const modes = ['car', 'bus', 'walk', 'bike', 'subway'];
  const result: TripLegsMapData = {};

  for (let i = 0; i < DEMO_CONFIG.tripLegPaths; i++) {
    const tripId = `${100 + i}_1`;
    const points = generateRandomPoints(2, bounds);
    const from = points[0]?.position || [-73.57, 45.50];
    const to = points[1]?.position || [-73.56, 45.51];
    const baseMode = modes[Math.floor(Math.random() * modes.length)];
    const policyMode = modes[Math.floor(Math.random() * modes.length)];

    result[tripId] = {
      baseline: [{ from, to, mode: baseMode }],
      policy: [{ from, to, mode: policyMode }],
    };
  }

  return result;
};

type MapType = 'emissions' | 'peopleResponse' | 'tripLegs';

const loadMapDataWithDelay = <T>(
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
        () => store.emissionsMapData,
        store.setEmissionsMapState,
        store.setEmissionsMapData,
        generateDemoEmissionsMapData
      );
      break;

    case 'peopleResponse':
      loadMapDataWithDelay(
        () => store.peopleResponseMapData,
        store.setPeopleResponseMapState,
        store.setPeopleResponseMapData,
        generateDemoPeopleResponseMapData
      );
      break;

    case 'tripLegs':
      loadMapDataWithDelay<TripLegsMapData>(
        () => store.tripLegsMapData,
        store.setTripLegsMapState,
        store.setTripLegsMapData,
        generateDemoTripLegsMapData
      );
      break;
  }
};
