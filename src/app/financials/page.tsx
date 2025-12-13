import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function FinancialsDashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Financials Dashboard</h1>
      <p className="text-muted-foreground">The main financial dashboard will be here, with KPIs, charts, and alerts.</p>
       <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <Link href="/financials/receipts" passHref><Button variant="outline">Collections</Button></Link>
        <Link href="/financials/vouchers" passHref><Button variant="outline">Disbursements</Button></Link>
        <Link href="/financials/deposits" passHref><Button variant="outline">Deposits</Button></Link>
        <Link href="/financials/budget" passHref><Button variant="outline">Budget</Button></Link>
        <Link href="/financials/reports" passHref><Button variant="outline">Reports</Button></Link>
        <Link href="/financials/settings" passHref><Button variant="outline">Settings</Button></Link>
        <Link href="/" passHref><Button>Back to Hub</Button></Link>
      </div>
    </div>
  );
}
