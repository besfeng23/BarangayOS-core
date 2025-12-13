import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ProgramsDashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Health Programs</h1>
      <p className="text-muted-foreground">A dashboard of all health programs (Immunization, Prenatal, etc.) will be here.</p>
      <div className="mt-4 flex gap-4">
        <Link href="/city-health" passHref><Button>Back to City Health Home</Button></Link>
        <Link href="/city-health/programs/immunization" passHref><Button variant="outline">View Immunization Program</Button></Link>
      </div>
    </div>
  );
}
