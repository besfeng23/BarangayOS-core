import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HealthEMRPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Health EMR</h1>
      <p className="text-muted-foreground">The Health EMR module dashboard will be here.</p>
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <Link href="/health-emr/patients" passHref><Button variant="outline">Patients</Button></Link>
        <Link href="/health-emr/queue" passHref><Button variant="outline">Queue</Button></Link>
        <Link href="/health-emr/reports" passHref><Button variant="outline">Reports</Button></Link>
        <Link href="/health-emr/settings" passHref><Button variant="outline">Settings</Button></Link>
        <Link href="/" passHref><Button>Back to Hub</Button></Link>
      </div>
    </div>
  );
}
