import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AlertsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Alerts & Follow-ups</h1>
      <p className="text-muted-foreground">An inbox for all alerts and required follow-ups will be here.</p>
      <div className="mt-4">
        <Link href="/city-health" passHref><Button>Back to City Health Home</Button></Link>
      </div>
    </div>
  );
}
