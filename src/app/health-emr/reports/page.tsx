import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ReportsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">EMR Reports</h1>
      <p className="text-muted-foreground">A dashboard of printable EMR reports will be here.</p>
       <div className="mt-4">
        <Link href="/health-emr" passHref><Button>Back to Health EMR Home</Button></Link>
      </div>
    </div>
  );
}
