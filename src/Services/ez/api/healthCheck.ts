import axios from 'axios';
import { useEZServiceStore } from '~store';
import { ApiResponse } from './apiResponse';

export async function checkBackendHealth(endpoint: string): Promise<boolean> {
  try {
    const response = await axios.get<ApiResponse<object>>(endpoint, { timeout: 5000 });
    const isAlive = response.data.statusCode === 200;
    useEZServiceStore.getState().setIsEzBackendAlive(isAlive);
    return isAlive;
  } catch {
    useEZServiceStore.getState().setIsEzBackendAlive(false);
    return false;
  }
}
