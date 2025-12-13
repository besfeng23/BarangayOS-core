'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';

export default function JobDetailsPage() {
  const params = useParams();
  const jobId = params.id;
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Job Details</h1>
      <p className="text-muted-foreground">Details for job <span className="font-mono bg-muted px-2 py-1 rounded">{jobId}</span> will be here.</p>
      <div className="mt-4 flex gap-4">
        <Link href="/jobs" passHref><Button>Back to Jobs</Button></Link>
        <Link href={`/applications/apply/${jobId}`} passHref><Button variant="secondary">Apply Now</Button></Link>
      </div>
    </div>
  );
}
