import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HistoryPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Transaction History</h1>
      <p className="text-muted-foreground">A filterable list of all transactions will be here.</p>
       <div className="mt-4 flex gap-4">
        <Link href="/emango" passHref><Button>Back to eMango Home</Button></Link>
        <Link href="/emango/transactions/tx-123" passHref><Button variant="outline">View Sample Transaction</Button></Link>
      </div>
    </div>
  );
}
