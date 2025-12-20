
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AuditPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-4 mb-8">
          <Link href="/emango" passHref>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
             <h1 className="text-2xl font-bold">Audit Logs</h1>
             <p className="text-muted-foreground">A detailed, filterable audit log for all wallet activities will be here.</p>
          </div>
        </div>
    </div>
  );
}
