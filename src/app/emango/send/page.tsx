import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SendPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Disbursement Hub</h1>
      <p className="text-muted-foreground">Options for sending money/aid will be here.</p>
      <div className="mt-4 flex gap-4">
        <Link href="/emango" passHref><Button>Back to eMango Home</Button></Link>
        <Link href="/emango/send/aid" passHref><Button variant="secondary">Disburse Aid Batch</Button></Link>
      </div>
    </div>
  );
}
