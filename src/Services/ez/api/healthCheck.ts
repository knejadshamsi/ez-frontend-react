import axios from 'axios';
import { useEZServiceStore } from '~store';
import { transitionConnectionState } from '../stores/types';
import { ApiResponse } from './apiResponse';

export async function checkBackendHealth(endpoint: string): Promise<boolean> {
  const store = useEZServiceStore.getState();

  try {
    const response = await axios.get<ApiResponse<object>>(endpoint, { timeout: 5000 });
    const isAlive = response.data.statusCode === 200;

    if (isAlive) {
      const next = transitionConnectionState(store.connectionState, true);
      store.setConnectionState(next);
    } else {
      const next = transitionConnectionState(store.connectionState, false);
      store.setConnectionState(next);
    }

    return isAlive;
  } catch {
    const next = transitionConnectionState(store.connectionState, false);
    store.setConnectionState(next);
    return false;
  }
}

export async function checkBackendHealthInitial(endpoint: string): Promise<boolean> {
  const store = useEZServiceStore.getState();

  try {
    const response = await axios.get<ApiResponse<object>>(endpoint, { timeout: 5000 });
    const isAlive = response.data.statusCode === 200;
    store.setConnectionState(isAlive ? 'FULL_CONNECT' : 'FULL_DISCONNECT');
    return isAlive;
  } catch {
    store.setConnectionState('FULL_DISCONNECT');
    return false;
  }
}
