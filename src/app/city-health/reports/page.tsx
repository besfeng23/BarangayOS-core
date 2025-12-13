import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CityHealthReportsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Reports & Analytics</h1>
      <p className="text-muted-foreground">A dashboard of printable reports will be here.</p>
      <div className="mt-4">
        <Link href="/city-health" passHref><Button>Back to City Health Home</Button></Link>
      </div>
    </div>
  );
}
