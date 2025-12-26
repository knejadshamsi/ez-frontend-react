import { useEffect, useRef } from 'react';

const UNIVERSAL_TIMEOUT_MS = 300000;

interface UniversalSSETimeoutConfig {
  onTimeout: () => void;
}

/**
 * Universal SSE timeout hook
 * three-layer safety net:
 * - Layer 1: Heartbeat (35s) - detects connection loss
 * - Layer 2: Universal Timeout (300s) - detects missing data
 * - Layer 3: SSE Error Events - backend failure reporting
 */
export function useUniversalSSETimeout(config: UniversalSSETimeoutConfig) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearCurrentTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const startTimeout = () => {
    clearCurrentTimeout();
    timeoutRef.current = setTimeout(() => {
      console.error('[SSE] Universal timeout - no data received within 5 minutes');
      config.onTimeout();
    }, UNIVERSAL_TIMEOUT_MS);
  };

  const resetTimeout = () => {
    startTimeout();
  };

  useEffect(() => {
    return () => {
      clearCurrentTimeout();
    };
  }, []);

  return {
    startTimeout,
    resetTimeout,
  };
}
