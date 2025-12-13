import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function QueuePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Clinic Queue</h1>
      <p className="text-muted-foreground">A view of patients in the queue (Waiting, In Consult, Done) will be here.</p>
      <div className="mt-4">
        <Link href="/city-health" passHref><Button>Back to City Health Home</Button></Link>
      </div>
    </div>
  );
}
