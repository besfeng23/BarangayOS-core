'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/bosDb';

export default function AddonRequestsPage() {
  const requests = useLiveQuery(() => 
    db.activity_log
      .where('type')
      .equals('QUOTATION_REQUESTED')
      .reverse()
      .sortBy('occurredAtISO'),
    []
  );

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">My Procurement Requests</h1>
      <p className="text-muted-foreground">A list of all hardware and service requests you've made.</p>
       <div className="mt-8 space-y-4">
          {requests && requests.length > 0 ? (
            requests.map(req => (
              <div key={req.id} className="p-4 border rounded-lg bg-zinc-900/50">
                  <p className="font-semibold">{req.subtitle}</p>
                  <p className="text-sm text-muted-foreground">
                    Requested on: {new Date(req.occurredAtISO).toLocaleString()}
                  </p>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">No requests made yet.</p>
          )}
      </div>
       <div className="mt-8">
        <Link href="/addons" passHref><Button variant="outline">Back to Add-ons Catalog</Button></Link>
      </div>
    </div>
  );
}
