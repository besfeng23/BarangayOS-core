
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
       <div className="flex items-center gap-4 mb-8">
          <Link href="/emango" passHref>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
             <h1 className="text-2xl font-bold">Wallet Settings</h1>
             <p className="text-muted-foreground">Settings for fees, roles, and limits will be here.</p>
          </div>
        </div>

        <div className="text-center py-16 border-2 border-dashed border-zinc-800 rounded-lg">
            <h3 className="text-lg font-semibold">Coming Soon</h3>
            <p className="text-muted-foreground mt-1">This section will allow configuration of wallet-specific rules.</p>
        </div>
    </div>
  );
}
