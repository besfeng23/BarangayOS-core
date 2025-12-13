import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function JobsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Jobs Portal</h1>
      <p className="text-muted-foreground">The main job browsing interface will be here.</p>
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <Link href="/jobs/1" passHref><Button variant="outline">View Sample Job</Button></Link>
        <Link href="/jobs/filters" passHref><Button variant="outline">Filters</Button></Link>
        <Link href="/applications" passHref><Button variant="outline">My Applications</Button></Link>
        <Link href="/saved" passHref><Button variant="outline">Saved Jobs</Button></Link>
        <Link href="/profile" passHref><Button variant="outline">My Profile</Button></Link>
        <Link href="/employer" passHref><Button variant="outline">Employer Dashboard</Button></Link>
        <Link href="/admin/jobs" passHref><Button variant="outline">Admin Moderation</Button></Link>
        <Link href="/" passHref><Button>Back to Hub</Button></Link>
      </div>
    </div>
  );
}
