import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function EmangoHomePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">eMango Wallet Home</h1>
      <p className="text-muted-foreground">Dashboard and quick actions will be here.</p>
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <Link href="/emango/collect" passHref><Button variant="outline">Collect Payment</Button></Link>
        <Link href="/emango/invoices" passHref><Button variant="outline">Invoices</Button></Link>
        <Link href="/emango/send" passHref><Button variant="outline">Send Money</Button></Link>
        <Link href="/emango/history" passHref><Button variant="outline">History</Button></Link>
        <Link href="/emango/reports" passHref><Button variant="outline">Reports</Button></Link>
        <Link href="/emango/settings" passHref><Button variant="outline">Settings</Button></Link>
        <Link href="/emango/audit" passHref><Button variant="outline">Audit</Button></Link>
        <Link href="/" passHref><Button>Back to Hub</Button></Link>
      </div>
    </div>
  );
}
