import axios from 'axios';
import { useEZSessionStore } from '~stores/session';
import { useEZOutputMapStore } from '~stores/output';
import { getBackendUrl } from './config';
import { loadDemoMapData } from '../output/demoMapData';
import { ApiResponse, unwrapResponse } from './apiResponse';

type MapType = 'emissions' | 'peopleResponse' | 'tripLegs';

const MAP_CONFIG = {
  emissions: {
    endpoint: 'emissions',
    dataProp: 'emissionsMapData' as const,
  },
  peopleResponse: {
    endpoint: 'people-response',
    dataProp: 'peopleResponseMapData' as const,
  },
  tripLegs: {
    endpoint: 'trip-legs',
    dataProp: 'tripLegsMapData' as const,
  },
} as const;

const fetchMapDataInternal = async (type: MapType): Promise<void> => {
  const store = useEZOutputMapStore.getState();
  const config = MAP_CONFIG[type];

  // Check if already loaded
  const data = store[config.dataProp];
  if (Array.isArray(data) ? data.length > 0 : data) {
    return;
  }

  // Capitalize first letter for method names (emissions -> Emissions)
  const typeCapitalized = type.charAt(0).toUpperCase() + type.slice(1);

  // Set loading state and clear error
  (store as any)[`set${typeCapitalized}MapState`]('loading');
  (store as any)[`set${typeCapitalized}MapError`](null);

  try {
    const backendUrl = getBackendUrl();
    const requestId = useEZSessionStore.getState().requestId!;

    const response = await axios.get<ApiResponse<unknown>>(
      `${backendUrl}/scenario/${requestId}/maps/${config.endpoint}`,
      { timeout: 15000 }
    );

    (store as any)[`set${typeCapitalized}MapData`](unwrapResponse(response));
    (store as any)[`set${typeCapitalized}MapState`]('success');
  } catch (error) {
    const message = error instanceof Error ? error.message : `Failed to fetch ${type} map data`;
    (store as any)[`set${typeCapitalized}MapError`](message);
    (store as any)[`set${typeCapitalized}MapState`]('error');
  }
};

export const fetchEmissionsMapData = async (): Promise<void> => {
  return fetchMapDataInternal('emissions');
};

export const fetchPeopleResponseMapData = async (): Promise<void> => {
  return fetchMapDataInternal('peopleResponse');
};

export const fetchTripLegsMapData = async (): Promise<void> => {
  return fetchMapDataInternal('tripLegs');
};

export const fetchMapData = async (
  mapType: 'emissions' | 'peopleResponse' | 'tripLegs',
  isDemoMode: boolean
): Promise<void> => {
  if (isDemoMode) {
    loadDemoMapData(mapType);
    return;
  }

  await fetchMapDataInternal(mapType);
};
