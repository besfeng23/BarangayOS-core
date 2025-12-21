
import { Button } from '@/components/ui/button';
import { Briefcase, User, Bookmark, Bell } from 'lucide-react';
import Link from 'next/link';

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700 sticky top-0 z-30">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/jobs" className="flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold">Jobs Portal</h1>
              <p className="text-sm text-slate-400">Opportunities within the community.</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/applications"><Button variant="ghost">My Applications</Button></Link>
            <Link href="/saved"><Button variant="ghost">Saved Jobs</Button></Link>
            <Link href="/profile"><Button variant="ghost">My Profile</Button></Link>
             <Link href="/"><Button variant="outline">Back to Hub</Button></Link>
          </nav>
           <div className="md:hidden">
                <Button variant="ghost" size="icon"><Bell /></Button>
            </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
