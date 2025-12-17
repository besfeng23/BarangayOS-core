'use client';
import { createContext, ReactNode } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useQueueCount } from '@/hooks/useQueueCount';
import { useSyncWorker } from '@/hooks/useSyncWorker';

interface SyncContextType {
  isOnline: boolean;
  queueCount: number;
}

export const SyncContext = createContext<SyncContextType | undefined>(
  undefined
);

export const SyncProvider = ({ children }: { children: ReactNode }) => {
  const { isOnline } = useNetworkStatus();
  const queueCount = useQueueCount();
  useSyncWorker(); // This hook will run the sync logic in the background

  const value = { isOnline, queueCount };

  return (
    <SyncContext.Provider value={value}>{children}</SyncContext.Provider>
  );
};
