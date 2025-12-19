
'use client';

import React, { useEffect, useState } from 'react';
import { getSystemStatus, type SystemStatus, type ModuleStatus } from '@/lib/bos/status/getSystemStatus';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

const StatusPill = ({ state }: { state: ModuleStatus['state'] }) => {
  const config = {
    OK: { icon: CheckCircle, color: 'text-green-400', label: 'OK' },
    WARN: { icon: AlertTriangle, color: 'text-yellow-400', label: 'Warning' },
    BROKEN: { icon: XCircle, color: 'text-red-400', label: 'Broken' },
  };
  const { icon: Icon, color, label } = config[state] || config.WARN;
  return (
    <div className={cn('flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full', color)}>
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </div>
  );
};

const Panel = ({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) => (
  <div className={cn('bg-zinc-900/40 border border-zinc-800 rounded-2xl', className)}>
    <h2 className="text-lg font-bold text-zinc-100 p-4 border-b border-zinc-800">{title}</h2>
    <div className="p-4 space-y-4">{children}</div>
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between items-center text-sm">
    <span className="text-zinc-400">{label}</span>
    <span className="font-mono text-zinc-100 text-right">{String(value ?? '-')}</span>
  </div>
);

export default function StatusPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshStatus = async () => {
    setLoading(true);
    try {
      const systemStatus = await getSystemStatus();
      setStatus(systemStatus);
    } catch (e) {
      console.error("Failed to get system status:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);
  
  const overallState = status?.modules.some(m => m.state === 'BROKEN') ? 'BROKEN' : status?.modules.some(m => m.state === 'WARN') ? 'WARN' : 'OK';

  return (
      <div className="max-w-6xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-zinc-100">System Status</h1>
                <p className="text-zinc-400 text-sm">
                    {status ? `Last checked: ${new Date(status.nowISO).toLocaleString()}`: 'Loading status...'}
                </p>
            </div>
            <div className="flex items-center gap-2">
                 <StatusPill state={overallState} />
                <Button onClick={refreshStatus} disabled={loading} size="sm" variant="outline">
                    <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
                    Refresh
                </Button>
            </div>
        </div>

        {loading && !status ? (
          <div className="text-center p-12 text-zinc-400">Loading system status...</div>
        ) : !status ? (
          <div className="text-center p-12 text-red-400">Failed to load system status.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel title="Modules" className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {status.modules.map(mod => (
                    <div key={mod.name} className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold">{mod.name}</h3>
                            <StatusPill state={mod.state} />
                        </div>
                        <ul className="text-xs text-zinc-400 mt-2 list-disc list-inside">
                            {mod.notes.map((note, i) => <li key={i}>{note}</li>)}
                        </ul>
                         <div className="mt-3">
                            <Link href={mod.route} passHref>
                                <Button size="sm" variant="secondary" className="w-full">Go to Module</Button>
                            </Link>
                        </div>
                    </div>
                ))}
              </div>
            </Panel>
            
            <Panel title="Offline Database (Dexie)">
              <InfoRow label="DB Name" value={status.dexie.dbName} />
              <InfoRow label="DB Version" value={status.dexie.version} />
              <div className="space-y-2 pt-2">
                  {status.dexie.stores.map(store => (
                      <div key={store.name} className="flex items-center gap-2 p-2 bg-zinc-800/50 rounded-md text-xs">
                          {store.exists ? <CheckCircle className="h-4 w-4 text-green-400" /> : <XCircle className="h-4 w-4 text-red-400" />}
                          <span className="font-mono flex-1">{store.name}</span>
                          <span className="text-zinc-400">{store.count !== null ? `${store.count} rows` : ''}</span>
                          {store.note && <span className="text-yellow-400">{store.note}</span>}
                      </div>
                  ))}
              </div>
            </Panel>

            <Panel title="Sync Queue">
                <InfoRow label="Pending" value={status.sync.pending} />
                <InfoRow label="Syncing" value={status.sync.syncing} />
                <InfoRow label="Failed" value={status.sync.failed} />
                <InfoRow label="Oldest Pending" value={status.sync.oldestPendingCreatedAt ? formatDistanceToNow(new Date(status.sync.oldestPendingCreatedAt), { addSuffix: true }) : '-'} />
                <InfoRow label="Last Sync" value={status.sync.lastSyncAt ? formatDistanceToNow(new Date(status.sync.lastSyncAt), { addSuffix: true }) : 'Never'} />
                <InfoRow label="Last Error" value={status.sync.lastError || '-'} />
            </Panel>

            <Panel title="Settings">
                <InfoRow label="Barangay Name" value={status.settings.barangayName} />
                <InfoRow label="Punong Barangay" value={status.settings.punongBarangay} />
                <InfoRow label="Trial Mode" value={status.settings.trialEnabled ? `Yes (${status.settings.daysRemaining} days left)` : 'No'} />
            </Panel>
            
             <Panel title="Recent Errors" className="lg:col-span-2">
              <div className="max-h-60 overflow-y-auto space-y-2">
                {status.errors.recent.length === 0 ? <p className="text-sm text-zinc-500">No recent errors recorded.</p> : (
                    status.errors.recent.map((err, i) => (
                        <div key={i} className="p-2 bg-red-950/30 border border-red-500/20 rounded-md font-mono text-xs">
                           <p className="text-red-300 font-bold">[{err.source}] {formatDistanceToNow(new Date(err.atISO), { addSuffix: true })}</p>
                           <p className="text-red-400 mt-1">{err.message}</p>
                        </div>
                    ))
                )}
              </div>
            </Panel>
          </div>
        )}
      </div>
  );
}

