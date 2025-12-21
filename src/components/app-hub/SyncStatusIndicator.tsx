'use client';

import { useSyncStatus } from '@/hooks/useSyncStatus';
import { cn } from '@/lib/utils';
import { Wifi, WifiOff } from 'lucide-react';

export default function SyncStatusIndicator() {
  const { isOnline, snapshot, state } = useSyncStatus();
  const queueCount = snapshot.pending + snapshot.syncing + snapshot.failed;
  const status = (() => {
    if (!isOnline) return { color: 'red', icon: WifiOff };
    if (state === 'error') return { color: 'red', icon: Wifi };
    if (queueCount > 0 || state === 'queued') return { color: 'amber', icon: Wifi };
    return { color: 'green', icon: Wifi };
  })();
  const colorClass = {
    red: 'bg-red-500 text-red-50',
    amber: 'bg-amber-500 text-amber-950 animate-pulse',
    green: 'bg-green-500 text-green-950',
  }[status.color];

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'w-3 h-3 rounded-full transition-colors',
          colorClass
        )}
      />
      {queueCount > 0 && (
        <span className="text-xs bg-zinc-800 text-zinc-100 px-2 py-0.5 rounded-full border border-zinc-700">
          {queueCount} queued
        </span>
      )}
    </div>
  );
}
