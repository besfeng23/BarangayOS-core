
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';

export default function InvoiceDetailsPage() {
  const params = useParams();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Invoice Details</h1>
      <p className="text-muted-foreground">Details for invoice <span className="font-mono bg-muted px-2 py-1 rounded">{params.id}</span> will be here, with QR code.</p>
      <div className="mt-4">
        <Link href="/emango/invoices" passHref><Button>Back to Invoices</Button></Link>
      </div>
    </div>
  );
}
