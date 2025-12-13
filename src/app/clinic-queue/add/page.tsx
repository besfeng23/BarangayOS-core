import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AddPatientToQueuePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Add Patient to Queue</h1>
      <p className="text-muted-foreground">The wizard for adding a new patient (resident search, QR scan, or walk-in) will be here.</p>
       <div className="mt-4">
        <Link href="/clinic-queue" passHref><Button>Back to Queue</Button></Link>
      </div>
    </div>
  );
}
