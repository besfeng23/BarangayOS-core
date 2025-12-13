import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CityHealthHomePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">City Health Dashboard</h1>
      <p className="text-muted-foreground">Dashboard with KPI tiles and quick actions will be here.</p>
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <Link href="/city-health/queue" passHref><Button variant="outline">Today's Queue</Button></Link>
        <Link href="/city-health/patients" passHref><Button variant="outline">Patients</Button></Link>
        <Link href="/city-health/reports" passHref><Button variant="outline">Reports</Button></Link>
        <Link href="/city-health/medicines" passHref><Button variant="outline">Medicines</Button></Link>
        <Link href="/city-health/programs" passHref><Button variant="outline">Programs</Button></Link>
        <Link href="/city-health/alerts" passHref><Button variant="outline">Alerts & Follow-ups</Button></Link>
        <Link href="/city-health/settings" passHref><Button variant="outline">Settings</Button></Link>
        <Link href="/" passHref><Button>Back to Hub</Button></Link>
      </div>
    </div>
  );
}
