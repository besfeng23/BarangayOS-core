import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function InvoicesPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Invoices</h1>
      <p className="text-muted-foreground">List of all invoices will be here.</p>
      <div className="mt-4 flex gap-4">
        <Link href="/emango" passHref><Button>Back to eMango Home</Button></Link>
        <Link href="/emango/invoices/new" passHref><Button variant="secondary">New Invoice</Button></Link>
        <Link href="/emango/invoices/inv-123" passHref><Button variant="outline">View Sample Invoice</Button></Link>
      </div>
    </div>
  );
}
