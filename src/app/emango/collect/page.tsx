import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CollectPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Collect Payment</h1>
      <p className="text-muted-foreground">QR scanner, invoice lookup, and manual entry will be here.</p>
      <div className="mt-4">
        <Link href="/emango" passHref><Button>Back to eMango Home</Button></Link>
      </div>
    </div>
  );
}
