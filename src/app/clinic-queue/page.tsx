import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ClinicQueuePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Clinic Queue Dashboard</h1>
      <p className="text-muted-foreground">The main dashboard for managing the clinic queue will be here.</p>
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <Link href="/clinic-queue/add" passHref><Button variant="outline">Add Patient</Button></Link>
        <Link href="/clinic-queue/records" passHref><Button variant="outline">Search Records</Button></Link>
        <Link href="/clinic-queue/reports" passHref><Button variant="outline">Reports</Button></Link>
        <Link href="/clinic-queue/settings" passHref><Button variant="outline">Settings</Button></Link>
        <Link href="/clinic-queue/visit/1" passHref><Button variant="outline">Sample Visit</Button></Link>
        <Link href="/" passHref><Button>Back to Hub</Button></Link>
      </div>
    </div>
  );
}
