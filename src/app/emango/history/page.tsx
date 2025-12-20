
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function HistoryPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-8">
            <Link href="/emango" passHref>
                <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
                </Button>
            </Link>
            <div>
                <h1 className="text-2xl font-bold">Transaction History</h1>
                <p className="text-muted-foreground">A filterable list of all transactions will be here.</p>
            </div>
        </div>
       <div className="mt-4 flex gap-4">
        <Link href="/emango/transactions/tx-123" passHref><Button variant="outline">View Sample Transaction</Button></Link>
      </div>
    </div>
  );
}
