import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { StatusNotification } from './StatusNotification';
import { useBatchStore } from '~stores/batch';
import { useEZSessionStore } from '~stores/session';
import { fetchScenarioStatus } from '~ez/api/scenarioStatus';
import { mapBackendStatus } from '~ez/api/batchPolling';
import type { BackgroundSimStatus } from '~stores/batch';
import '../locales';

const POLL_INTERVAL_MS = 15000;

interface PollingStateProps {
  onCancel: () => void;
}

export const PollingState = ({ onCancel }: PollingStateProps) => {
  const { t } = useTranslation('ez-progress');
  const isBatchMode = useBatchStore((s) => s.isBatchMode);
  const activeSimId = useBatchStore((s) => s.activeSimId);
  const simulations = useBatchStore((s) => s.simulations);

  const [polledStatus, setPolledStatus] = useState<BackgroundSimStatus | null>(null);
  const [polledProgress, setPolledProgress] = useState<string | null>(null);
  const [hasConnected, setHasConnected] = useState(false);
  const [isAttempting, setIsAttempting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = useCallback(() => {
    setCountdown(Math.floor(POLL_INTERVAL_MS / 1000));
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    const requestId = isBatchMode
      ? activeSimId
      : useEZSessionStore.getState().requestId;
    if (!requestId) return;

    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;
      setIsAttempting(true);
      try {
        const response = await fetchScenarioStatus(requestId);
        if (!cancelled) {
          setHasConnected(true);
          setPolledStatus(mapBackendStatus(response.status));
          setPolledProgress(response.progress);
        }
      } catch {
        // Poll failed - connection still lost
      } finally {
        if (!cancelled) {
          setIsAttempting(false);
          startCountdown();
        }
      }
    };

    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isBatchMode, activeSimId, startCountdown]);

  let title: string;
  let subtitle: string;

  if (hasConnected) {
    // Connected - show actual status
    let status: BackgroundSimStatus | null;

    if (isBatchMode) {
      const activeSim = simulations.find((s) => s.requestId === activeSimId);
      status = activeSim?.status ?? polledStatus;
    } else {
      status = polledStatus;
    }

    const statusTitles: Partial<Record<BackgroundSimStatus, string>> = {
      queued: t('polling.statusQueued'),
      running: t('polling.statusRunning'),
    };
    title = (status && statusTitles[status]) ?? t('polling.monitoring');
    subtitle = isBatchMode
      ? t('polling.batchSubtitle')
      : polledProgress ?? t('polling.subtitle');
  } else {
    // Not connected yet - show connection status
    title = t('polling.connectionLost');
    subtitle = isAttempting
      ? t('polling.reconnecting')
      : t('polling.reconnectIn', { seconds: countdown });
  }

  return (
    <StatusNotification
      title={title}
      subtitle={subtitle}
      onCancel={onCancel}
      cancelLabel={t('buttons.cancel')}
    />
  );
};
