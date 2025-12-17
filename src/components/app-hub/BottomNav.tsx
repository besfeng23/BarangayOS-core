'use client';

import { Home, History, Printer, Settings as SettingsIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/history', label: 'History', icon: History },
  { href: '/print', label: 'Print', icon: Printer },
  { href: '/settings', label: 'Settings', icon: SettingsIcon },
];

const NavItem = ({
  href,
  label,
  icon: Icon,
  isActive,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
}) => (
  <Link
    href={href}
    className="flex flex-col items-center justify-center gap-1 w-full h-full text-center"
    aria-current={isActive ? 'page' : undefined}
  >
    <div className="relative w-full flex justify-center">
      {isActive && (
        <div className="absolute -top-3 h-1 w-8 bg-amber-400 rounded-full" />
      )}
      <Icon
        className={cn(
          'w-6 h-6 transition-colors',
          isActive ? 'text-amber-400' : 'text-zinc-400 group-hover:text-zinc-200'
        )}
      />
    </div>
    <span
      className={cn(
        'text-xs font-medium transition-colors',
        isActive ? 'text-amber-400' : 'text-zinc-400 group-hover:text-zinc-200'
      )}
    >
      {label}
    </span>
  </Link>
);

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[56px] z-20 border-t border-zinc-800 bg-zinc-950/90 backdrop-blur">
      <div className="grid grid-cols-4 h-full">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            isActive={pathname === item.href}
          />
        ))}
      </div>
    </nav>
  );
}
