
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  FileBadge, 
  BarChart3, 
  Settings, 
  LogOut,
  Shield,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAuth } from 'firebase/auth';

const menuItems = [
  { href: '/', icon: Home, label: 'App Hub' },
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/residents', icon: Users, label: 'Resident Index' },
  { href: '/blotter', icon: ClipboardList, label: 'Blotter Log' },
  { href: '/certificates', icon: FileBadge, label: 'Certificates' },
  { href: '/reports', icon: BarChart3, label: 'Reports', badge: 'CAPTAIN' },
  { href: '/settings', icon: Settings, label: 'Settings', badge: 'ADMIN' },
];

const NavItem = ({ href, icon: Icon, label, badge }: (typeof menuItems)[0]) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} passHref>
      <div
        className={cn(
          'flex items-center p-4 rounded-lg cursor-pointer h-[52px]',
          'text-slate-300 hover:bg-slate-700 hover:text-white',
          isActive && 'bg-blue-600/80 text-white font-semibold'
        )}
      >
        <Icon className="h-6 w-6 mr-4" />
        <span className="text-lg">{label}</span>
        {badge && (
          <Badge 
            variant="secondary" 
            className="ml-auto bg-slate-600 text-slate-200"
          >
            {badge}
          </Badge>
        )}
      </div>
    </Link>
  );
};

export default function Sidebar() {
  const router = useRouter();
  
  const handleLogout = async () => {
    const auth = getAuth();
    await auth.signOut();
    router.push('/login');
  };

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-700 flex-col hidden md:flex">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <Shield className="h-10 w-10 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">BarangayOS</h1>
            <p className="text-sm text-slate-400">Digital Governance Terminal</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>
      <div className="p-6 border-t border-slate-700">
        <p className="text-xs text-slate-500 mb-4">Terminal ID: T-101</p>
        <Button variant="outline" className="w-full h-12 text-lg" onClick={handleLogout}>
          <LogOut className="mr-2 h-5 w-5" />
          Log Out
        </Button>
      </div>
    </aside>
  );
}
