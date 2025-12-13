import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DisburseAidPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Disburse Aid Batch</h1>
      <p className="text-muted-foreground">UI for creating and managing aid disbursement batches will be here.</p>
      <div className="mt-4">
        <Link href="/emango/send" passHref><Button>Back to Disbursement Hub</Button></Link>
      </div>
    </div>
  );
}
