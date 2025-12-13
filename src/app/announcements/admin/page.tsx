import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AnnouncementsAdminPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Announcements Admin</h1>
      <p className="text-muted-foreground">The approval queue and admin tools for announcements will be here.</p>
       <div className="mt-4">
        <Link href="/announcements" passHref><Button>Back to Announcements</Button></Link>
      </div>
    </div>
  );
}
