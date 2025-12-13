import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">EMR Settings</h1>
      <p className="text-muted-foreground">Configuration for the Health EMR module will be here.</p>
       <div className="mt-4">
        <Link href="/health-emr" passHref><Button>Back to Health EMR Home</Button></Link>
      </div>
    </div>
  );
}
