import axios from 'axios';
import { useEZSessionStore } from '~stores/session';
import { useEZOutputMapStore } from '~stores/output';
import { getBackendUrl } from './config';
import { loadDemoMapData } from '../output/demoMapData';
import { ApiResponse, unwrapResponse } from './apiResponse';
import type { OutputComponentState } from '~stores/output/types';

const MAP_DATA_FETCH_TIMEOUT_MS = 15000;

type MapType = 'emissions' | 'peopleResponse' | 'tripLegs';

interface MapTypeConfig {
  endpoint: string;
  dataProp: 'emissionsMapData' | 'peopleResponseMapData' | 'tripLegsMapData';
  setState: (state: OutputComponentState) => void;
  setError: (error: string | null) => void;
  setData: (data: unknown) => void;
}

const getMapConfig = (): Record<MapType, MapTypeConfig> => {
  const store = useEZOutputMapStore.getState();
  return {
    emissions: {
      endpoint: 'emissions',
      dataProp: 'emissionsMapData',
      setState: (state) => store.setEmissionsMapState(state),
      setError: (error) => store.setEmissionsMapError(error),
      setData: (data) => store.setEmissionsMapData(data as Parameters<typeof store.setEmissionsMapData>[0]),
    },
    peopleResponse: {
      endpoint: 'people-response',
      dataProp: 'peopleResponseMapData',
      setState: (state) => store.setPeopleResponseMapState(state),
      setError: (error) => store.setPeopleResponseMapError(error),
      setData: (data) => store.setPeopleResponseMapData(data as Parameters<typeof store.setPeopleResponseMapData>[0]),
    },
    tripLegs: {
      endpoint: 'trip-legs',
      dataProp: 'tripLegsMapData',
      setState: (state) => store.setTripLegsMapState(state),
      setError: (error) => store.setTripLegsMapError(error),
      setData: (data) => store.setTripLegsMapData(data as Parameters<typeof store.setTripLegsMapData>[0]),
    },
  };
};

const fetchMapDataInternal = async (type: MapType): Promise<void> => {
  const store = useEZOutputMapStore.getState();
  const config = getMapConfig()[type];

  // Check if already loaded
  const data = store[config.dataProp];
  if (Array.isArray(data) ? data.length > 0 : data) {
    return;
  }

  config.setState('loading');
  config.setError(null);

  try {
    const backendUrl = getBackendUrl();
    const requestId = useEZSessionStore.getState().requestId!;

    const response = await axios.get<ApiResponse<unknown>>(
      `${backendUrl}/scenario/${requestId}/maps/${config.endpoint}`,
      { timeout: MAP_DATA_FETCH_TIMEOUT_MS }
    );

    config.setData(unwrapResponse(response));
    config.setState('success');
  } catch (error) {
    const message = error instanceof Error ? error.message : `Failed to fetch ${type} map data`;
    config.setError(message);
    config.setState('error');
  }
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
