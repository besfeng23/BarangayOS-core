import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NewInvoicePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Create New Invoice</h1>
      <p className="text-muted-foreground">Form to create a new invoice will be here.</p>
      <div className="mt-4">
        <Link href="/emango/invoices" passHref><Button>Back to Invoices</Button></Link>
      </div>
    </div>
  );
}
