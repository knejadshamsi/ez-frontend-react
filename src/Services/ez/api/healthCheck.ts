import { useEZServiceStore } from '~store';

const TIMEOUT = 5000;

export async function checkBackendHealth(endpoint: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    const response = await fetch(endpoint, { signal: controller.signal });
    clearTimeout(timeoutId);

    const isAlive = response.ok;
    useEZServiceStore.getState().setIsEzBackendAlive(isAlive);

    return isAlive;
  } catch {
    useEZServiceStore.getState().setIsEzBackendAlive(false);
    return false;
  }
}
