'use client';

import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useQueueCount } from '@/hooks/useQueueCount';
import { cn } from '@/lib/utils';
import { Wifi, WifiOff } from 'lucide-react';

export default function SyncStatusIndicator() {
  const { isOnline } = useNetworkStatus();
  const queueCount = useQueueCount();

  const getStatus = () => {
    if (!isOnline) return { color: 'red', icon: WifiOff };
    if (queueCount > 0) return { color: 'amber', icon: Wifi };
    return { color: 'green', icon: Wifi };
  };

  const status = getStatus();
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
