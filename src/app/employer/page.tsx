import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function EmployerDashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Employer Dashboard</h1>
      <p className="text-muted-foreground">The dashboard for employers to manage job posts and applicants will be here.</p>
       <div className="mt-4">
        <Link href="/jobs" passHref><Button>Back to Jobs</Button></Link>
      </div>
    </div>
  );
}
