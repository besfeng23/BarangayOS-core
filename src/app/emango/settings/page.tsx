import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Wallet Settings</h1>
      <p className="text-muted-foreground">Settings for fees, roles, and limits will be here.</p>
      <div className="mt-4">
        <Link href="/emango" passHref><Button>Back to eMango Home</Button></Link>
      </div>
    </div>
  );
}
