import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">My Job Profile</h1>
      <p className="text-muted-foreground">The user's job-seeking profile will be here.</p>
       <div className="mt-4">
        <Link href="/jobs" passHref><Button>Back to Jobs</Button></Link>
      </div>
    </div>
  );
}
