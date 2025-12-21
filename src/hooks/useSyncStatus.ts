'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { db } from '@/lib/bosDb';
import { useNetworkStatus } from './useNetworkStatus';

export type SyncBadgeState = 'offline' | 'queued' | 'synced' | 'error';

export type SyncSnapshot = {
  pending: number;
  syncing: number;
  failed: number;
  lastSyncAt: number | null;
};

export const deriveSyncBadgeState = (isOnline: boolean, snapshot: SyncSnapshot): SyncBadgeState => {
  if (!isOnline) return 'offline';
  if (snapshot.failed > 0) return 'error';
  if (snapshot.pending + snapshot.syncing > 0) return 'queued';
  return 'synced';
};

export function useSyncStatus() {
  const { isOnline } = useNetworkStatus();

  const snapshot = useLiveQuery<SyncSnapshot>(async () => {
    try {
      const pending = await db.sync_queue.where('status').equals('pending').count();
      const syncing = await db.sync_queue.where('status').equals('syncing').count();
      const failed = await db.sync_queue.where('status').equals('failed').count();
      const lastSyncRow = await db.meta.get('lastSyncAt');
      return {
        pending: pending || 0,
        syncing: syncing || 0,
        failed: failed || 0,
        lastSyncAt: lastSyncRow?.value ?? null,
      };
    } catch {
      return { pending: 0, syncing: 0, failed: 0, lastSyncAt: null };
    }
  }, [], { pending: 0, syncing: 0, failed: 0, lastSyncAt: null });

  const derived = useMemo(() => {
    const state = deriveSyncBadgeState(isOnline, snapshot);
    const totalQueued = snapshot.pending + snapshot.syncing + snapshot.failed;
    const label = (() => {
      if (state === 'offline') return 'Offline • Queued';
      if (state === 'queued') return totalQueued > 0 ? `Queued (${totalQueued})` : 'Queued';
      if (state === 'error') return `Needs Attention (${snapshot.failed})`;
      return 'Online • Synced';
    })();
    return { state, label, totalQueued };
  }, [isOnline, snapshot]);

  return {
    isOnline,
    snapshot,
    state: derived.state as SyncBadgeState,
    label: derived.label,
    totalQueued: derived.totalQueued,
  };
}

export function formatSyncStatus(state: SyncBadgeState, count: number) {
  if (state === 'offline') return 'Offline • Queued';
  if (state === 'error') return `Sync Error (${count})`;
  if (state === 'queued') return count > 0 ? `Queued (${count})` : 'Queued';
  return 'Online • Synced';
}
