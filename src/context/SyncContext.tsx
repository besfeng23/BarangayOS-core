'use client';
import { createContext, ReactNode } from 'react';
import { useSyncWorker } from '@/hooks/useSyncWorker';
import { useSyncStatus } from '@/hooks/useSyncStatus';

export interface SyncContextType extends ReturnType<typeof useSyncStatus> {}

export const SyncContext = createContext<SyncContextType | undefined>(
  undefined
);

export const SyncProvider = ({ children }: { children: ReactNode }) => {
  const syncState = useSyncStatus();
  useSyncWorker(); // background sync based on network state

  return (
    <SyncContext.Provider value={syncState}>{children}</SyncContext.Provider>
  );
};
