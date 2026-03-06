import localforage from 'localforage';
import { useCallback, useEffect, useState } from 'react';

// Initialize localforage instance for SCG data
const scgStore = localforage.createInstance({
  name: 'openSCG',
  storeName: 'sessions',
});

export function useLocalCache() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Ensure localforage is ready
    scgStore.ready().then(() => setIsReady(true));
  }, []);

  const saveSessionData = useCallback(async (sessionId: string, data: unknown) => {
    try {
      await scgStore.setItem(sessionId, {
        timestamp: Date.now(),
        data,
      });
      console.log(`[Cache] Saved session ${sessionId} locally.`);
    } catch (error) {
      console.error(`[Cache] Failed to save session ${sessionId}:`, error);
    }
  }, []);

  const getSessionData = useCallback(async (sessionId: string) => {
    try {
      const cached = await scgStore.getItem<{ timestamp: number; data: unknown }>(sessionId);
      if (cached) {
        console.log(`[Cache] Retrieved session ${sessionId} from local storage.`);
        return cached.data;
      }
      return null;
    } catch (error) {
      console.error(`[Cache] Failed to retrieve session ${sessionId}:`, error);
      return null;
    }
  }, []);

  const clearSessionData = useCallback(async (sessionId: string) => {
    try {
      await scgStore.removeItem(sessionId);
    } catch (error) {
      console.error(`[Cache] Failed to clear session ${sessionId}:`, error);
    }
  }, []);

  return {
    isReady,
    saveSessionData,
    getSessionData,
    clearSessionData,
  };
}
