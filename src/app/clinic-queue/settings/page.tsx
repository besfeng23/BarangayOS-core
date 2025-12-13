import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ClinicSettingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Clinic Settings</h1>
      <p className="text-muted-foreground">Settings for queue rules, clinic schedules, and templates will be here.</p>
       <div className="mt-4">
        <Link href="/clinic-queue" passHref><Button>Back to Queue</Button></Link>
      </div>
    </div>
  );
}
