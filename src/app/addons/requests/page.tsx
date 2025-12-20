import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AddonRequestsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">My Procurement Requests</h1>
      <p className="text-muted-foreground">A list of all hardware and service requests will be here.</p>
       <div className="mt-4">
        <Link href="/addons" passHref><Button>Back to Add-ons</Button></Link>
      </div>
    </div>
  );
}