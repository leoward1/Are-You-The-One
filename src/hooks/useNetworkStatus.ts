import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

const PING_URL = 'https://jaspfotwnmjqqwoujnfm.supabase.co/auth/v1/';
const TIMEOUT_MS = 4000;
const POLL_INTERVAL_MS = 15000;

export function useNetworkStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkConnectivity = useCallback(async () => {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
      await fetch(PING_URL, { method: 'HEAD', signal: controller.signal });
      clearTimeout(id);
      setIsOnline(true);
    } catch {
      setIsOnline(false);
    }
  }, []);

  useEffect(() => {
    checkConnectivity();
    intervalRef.current = setInterval(checkConnectivity, POLL_INTERVAL_MS);

    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') checkConnectivity();
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      subscription.remove();
    };
  }, [checkConnectivity]);

  return isOnline;
}
