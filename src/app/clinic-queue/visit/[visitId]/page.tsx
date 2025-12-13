'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';

export default function VisitDetailPage() {
  const params = useParams();
  const visitId = params.visitId;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Visit Details</h1>
      <p className="text-muted-foreground">The detailed view for visit <span className="font-mono bg-muted px-2 py-1 rounded">{visitId}</span> with tabs for triage, consult, etc., will be here.</p>
      <div className="mt-4">
        <Link href="/clinic-queue" passHref><Button>Back to Queue</Button></Link>
      </div>
    </div>
  );
}
