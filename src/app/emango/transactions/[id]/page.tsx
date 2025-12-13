'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';

export default function TransactionDetailsPage() {
  const params = useParams();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Transaction Details</h1>
      <p className="text-muted-foreground">Details for transaction <span className="font-mono bg-muted px-2 py-1 rounded">{params.id}</span> will be here, with audit trail.</p>
      <div className="mt-4">
        <Link href="/emango/history" passHref><Button>Back to History</Button></Link>
      </div>
    </div>
  );
}
