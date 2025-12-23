'use client';

import Link from 'next/link';
import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LolaBanner } from './feedback';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';

type LolaHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  backHref?: string;
  className?: string;
};

export function LolaHeader({ title, subtitle, action, backHref, className }: LolaHeaderProps) {
  const isOffline = useOfflineStatus();

  return (
    <div className={cn('mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4', className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            {backHref && (
              <Link href={backHref} className="text-base font-semibold text-blue-700 underline underline-offset-2">
                ← Back
              </Link>
            )}
            <h1 className="text-3xl font-bold leading-tight text-slate-900">{title}</h1>
          </div>
          {subtitle && <p className="text-base text-slate-600 leading-snug">{subtitle}</p>}
        </div>
        {action ? <div className="w-full sm:w-auto">{action}</div> : null}
      </div>
      {isOffline && (
        <LolaBanner
          variant="offline"
          title="Offline Mode"
          message="You're working offline. Actions will sync when connection returns."
          compact
        />
      )}
    </div>
  );
}
