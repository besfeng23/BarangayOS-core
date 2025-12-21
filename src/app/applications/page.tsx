
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/bosDb';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { FileCheck2, ArrowLeft } from 'lucide-react';

export default function MyApplicationsPage() {
  const applications = useLiveQuery(() => 
    db.activity_log
      .where('type')
      .equals('JOB_APPLICATION_SUBMITTED')
      .reverse()
      .sortBy('occurredAtISO'),
    []
  );

  return (
    <div className="max-w-4xl mx-auto">
        <Link href="/jobs" className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs Portal
        </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">My Applications</CardTitle>
          <CardDescription>A list of all the jobs you have applied for through the portal.</CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
           <div className="space-y-4">
              {applications && applications.length > 0 ? (
                applications.map(req => (
                  <div key={req.id} className="p-4 border rounded-lg bg-slate-800/50 flex items-center gap-4">
                      <div className="p-2 bg-green-500/20 rounded-full">
                          <FileCheck2 className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <p className="font-semibold">{req.subtitle}</p>
                        <p className="text-sm text-muted-foreground">
                          Applied on: {new Date(req.occurredAtISO).toLocaleString()}
                        </p>
                      </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 border-2 border-dashed border-zinc-700 rounded-lg">
                    <h3 className="text-lg font-semibold">No Applications Yet</h3>
                    <p className="text-muted-foreground mt-2">You haven't applied for any jobs. Start browsing now!</p>
                     <Link href="/jobs" passHref className="mt-6 inline-block">
                        <Button>Browse Jobs</Button>
                    </Link>
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
