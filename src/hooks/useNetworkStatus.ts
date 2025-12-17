'use client';

import { useState, useEffect, useCallback } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { getDocFromServer } from 'firebase/firestore';

export function useNetworkStatus(checkIntervalMs = 15000) {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  const checkFirebaseConnection = useCallback(async () => {
    if (!navigator.onLine) {
      setIsOnline(false);
      return false;
    }
    try {
      // Use getDocFromServer to force a server request
      // We use a non-existent doc to minimize reads if it goes through
      const healthCheckDoc = doc(db, 'meta/health');
      await getDocFromServer(healthCheckDoc);
      setIsOnline(true);
      return true;
    } catch (error: any) {
      if (error.code === 'unavailable') {
         setIsOnline(false);
         return false;
      }
      // Other errors might not mean offline, but for our purpose, we'll treat them as such
      console.warn('Firebase connection check failed:', error);
      setIsOnline(false);
      return false;
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => checkFirebaseConnection();
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Perform an initial check
    checkFirebaseConnection();

    // Periodically check connection status
    const intervalId = setInterval(checkFirebaseConnection, checkIntervalMs);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [checkFirebaseConnection, checkIntervalMs]);

  return { isOnline, checkConnection: checkFirebaseConnection };
}
