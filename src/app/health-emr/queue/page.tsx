import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function QueuePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Clinic Queue</h1>
      <p className="text-muted-foreground">The patient queue for the clinic will be displayed here.</p>
       <div className="mt-4">
        <Link href="/health-emr" passHref><Button>Back to Health EMR Home</Button></Link>
      </div>
    </div>
  );
}
