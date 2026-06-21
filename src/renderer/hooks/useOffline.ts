import { useState, useEffect, useCallback } from 'react';

interface OfflineState {
  isOnline: boolean;
  isServerReachable: boolean;
  isStripeAvailable: boolean;
  isDegraded: boolean;
}

const SERVER_URL = 'http://127.0.0.1:3847';
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

export function useOffline() {
  const [state, setState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    isServerReachable: true,
    isStripeAvailable: true,
    isDegraded: false,
  });

  const checkServerHealth = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${SERVER_URL}/api/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const isReachable = response.ok;
      setState((prev) => ({
        ...prev,
        isServerReachable: isReachable,
        isDegraded: !prev.isOnline || !isReachable,
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        isServerReachable: false,
        isDegraded: true,
      }));
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setState((prev) => ({
        ...prev,
        isOnline: true,
        isDegraded: !prev.isServerReachable,
      }));
      checkServerHealth();
    };

    const handleOffline = () => {
      setState((prev) => ({
        ...prev,
        isOnline: false,
        isStripeAvailable: false,
        isDegraded: true,
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial health check
    checkServerHealth();

    // Periodic health checks
    const interval = setInterval(checkServerHealth, HEALTH_CHECK_INTERVAL);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [checkServerHealth]);

  return {
    ...state,
    checkServerHealth,
    isCashOnly: !state.isOnline || !state.isStripeAvailable,
  };
}
