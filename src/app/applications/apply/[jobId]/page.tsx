'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';

export default function ApplyPage() {
  const params = useParams();
  const jobId = params.jobId;
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Apply for Job</h1>
      <p className="text-muted-foreground">Application wizard for job <span className="font-mono bg-muted px-2 py-1 rounded">{jobId}</span> will be here.</p>
       <div className="mt-4">
        <Link href={`/jobs/${jobId}`} passHref><Button>Back to Job Details</Button></Link>
      </div>
    </div>
  );
}
