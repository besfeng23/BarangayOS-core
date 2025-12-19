
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AddonsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Add-ons & Procurement</h1>
      <p className="text-muted-foreground">The catalog for hardware and service add-ons will be here.</p>
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <Link href="/addons/category/field-gear" passHref><Button variant="outline">Field & Patrol</Button></Link>
        <Link href="/addons/category/monitoring" passHref><Button variant="outline">Cameras</Button></Link>
        <Link href="/addons/category/vehicle" passHref><Button variant="outline">Vehicle & Asset</Button></Link>
        <Link href="/addons/category/emergency" passHref><Button variant="outline">Emergency & Alerts</Button></Link>
        <Link href="/addons/category/info-systems" passHref><Button variant="outline">Public Information</Button></Link>
        <Link href="/addons/requests" passHref><Button variant="secondary">View My Requests</Button></Link>
      </div>
    </div>
  );
}
