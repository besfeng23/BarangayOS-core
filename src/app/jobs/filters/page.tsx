import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function JobFiltersPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Job Filters</h1>
      <p className="text-muted-foreground">A bottom sheet or modal with filter options will be here.</p>
       <div className="mt-4">
        <Link href="/jobs" passHref><Button>Back to Jobs</Button></Link>
      </div>
    </div>
  );
}
