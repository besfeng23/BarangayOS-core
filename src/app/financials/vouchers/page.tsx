import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function VouchersPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Disbursement Vouchers</h1>
      <p className="text-muted-foreground">The list of disbursement vouchers will be here.</p>
       <div className="mt-4">
        <Link href="/financials" passHref><Button>Back to Financials Dashboard</Button></Link>
      </div>
    </div>
  );
}
