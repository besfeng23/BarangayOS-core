import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PastVisitsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Past Visit Records</h1>
      <p className="text-muted-foreground">A searchable and filterable list of all past clinic visits will be here.</p>
       <div className="mt-4">
        <Link href="/clinic-queue" passHref><Button>Back to Queue</Button></Link>
      </div>
    </div>
  );
}
