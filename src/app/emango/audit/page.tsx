import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AuditPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Audit Logs</h1>
      <p className="text-muted-foreground">A detailed, filterable audit log for all wallet activities will be here.</p>
      <div className="mt-4">
        <Link href="/emango" passHref><Button>Back to eMango Home</Button></Link>
      </div>
    </div>
  );
}
