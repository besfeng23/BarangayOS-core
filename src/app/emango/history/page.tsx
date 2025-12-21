
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, History } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/bosDb';

export default function HistoryPage() {
  const transactions = useLiveQuery(() => 
    db.activity_log
      .where('type')
      .anyOf('PAYMENT_COLLECTED', 'PAYMENT_DISBURSED')
      .reverse()
      .sortBy('occurredAtISO'),
    []
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-8">
            <Link href="/emango" passHref>
                <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
                </Button>
            </Link>
            <div>
                <h1 className="text-2xl font-bold">Transaction History</h1>
                <p className="text-muted-foreground">A list of all payments collected on this terminal.</p>
            </div>
        </div>

       <div className="mt-4 space-y-3">
          {transactions && transactions.length > 0 ? (
            transactions.map(tx => (
              <div key={tx.id} className="p-4 border rounded-lg bg-zinc-900/50 flex items-center gap-4">
                  <div className="p-2 bg-green-500/20 rounded-full">
                      <History className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold">{tx.title}</p>
                    <p className="text-sm text-muted-foreground">{tx.subtitle}</p>
                    <p className="text-xs text-zinc-500 mt-1">{new Date(tx.occurredAtISO).toLocaleString()}</p>
                  </div>
              </div>
            ))
          ) : (
             <div className="text-center py-16 border-2 border-dashed border-zinc-800 rounded-lg">
                <h3 className="text-lg font-semibold">No Transactions Logged</h3>
                <p className="text-muted-foreground mt-1">Use the "Collect Payment" feature to log a new transaction.</p>
             </div>
          )}
       </div>
    </div>
  );
}
