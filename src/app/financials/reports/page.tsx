import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function FinancialsReportsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Financial Reports</h1>
      <p className="text-muted-foreground">The library of financial reports will be here.</p>
       <div className="mt-4">
        <Link href="/financials" passHref><Button>Back to Financials Dashboard</Button></Link>
      </div>
    </div>
  );
}
