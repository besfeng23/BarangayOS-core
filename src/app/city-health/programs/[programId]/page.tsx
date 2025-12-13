'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';

export default function ProgramDetailPage() {
  const params = useParams();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Program Details</h1>
      <p className="text-muted-foreground">Details for program <span className="font-mono bg-muted px-2 py-1 rounded">{params.programId}</span> will be here.</p>
      <div className="mt-4">
        <Link href="/city-health/programs" passHref><Button>Back to Programs</Button></Link>
      </div>
    </div>
  );
}
