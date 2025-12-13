import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PatientsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Patient Directory</h1>
      <p className="text-muted-foreground">A searchable list of all patients in the EMR will be here.</p>
       <div className="mt-4">
        <Link href="/health-emr" passHref><Button>Back to Health EMR Home</Button></Link>
      </div>
    </div>
  );
}
