import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SavedJobsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Saved Jobs</h1>
      <p className="text-muted-foreground">A list of bookmarked jobs will be here.</p>
       <div className="mt-4">
        <Link href="/jobs" passHref><Button>Back to Jobs</Button></Link>
      </div>
    </div>
  );
}
