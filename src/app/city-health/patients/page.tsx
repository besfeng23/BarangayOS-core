import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PatientsListPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Patient Registry</h1>
      <p className="text-muted-foreground">A searchable list of all patients will be here.</p>
      <div className="mt-4 flex gap-4">
        <Link href="/city-health" passHref><Button>Back to City Health Home</Button></Link>
        <Link href="/city-health/patients/patient-123" passHref><Button variant="outline">View Sample Patient</Button></Link>
      </div>
    </div>
  );
}
