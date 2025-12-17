'use client';
import { useEffect, useState } from 'react';
import { getLogs } from '@/lib/activityLog';
import { ActivityLogItem } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function HistoryPage() {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const recentLogs = await getLogs();
        setLogs(recentLogs);
      } catch (error) {
        console.error('Failed to fetch activity logs:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">Activity History</h1>
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>Recent Actions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading history...</p>
          ) : logs.length === 0 ? (
            <p className="text-zinc-400">No activity has been recorded yet.</p>
          ) : (
            <ScrollArea className="h-[60vh]">
              <ul className="space-y-4">
                {logs.map((log) => (
                  <li
                    key={log.id}
                    className="flex items-center justify-between gap-4 p-3 rounded-lg bg-zinc-800/50"
                  >
                    <p className="font-medium">{log.message}</p>
                    <p className="text-xs text-zinc-400 whitespace-nowrap">
                      {formatDistanceToNow(new Date(log.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
