
'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ModuleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  badgeCount?: number;
  badgeLabel?: string;
  badgeColor?: 'red' | 'amber';
}

const badgeStyles = {
  red: 'bg-red-600/20 text-red-200 border border-red-500/30',
  amber: 'bg-amber-500/20 text-amber-100 border border-amber-400/30',
};

export default function ModuleCard({
  title,
  description,
  icon: Icon,
  href,
  badgeCount = 0,
  badgeLabel,
  badgeColor = 'amber',
}: ModuleCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 cursor-pointer hover:bg-zinc-900/60 hover:shadow-lg active:scale-[0.99] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
    >
      {badgeCount > 0 && badgeLabel && (
        <Badge
          className={cn(
            'absolute top-3 right-3 text-xs px-2 py-0.5',
            badgeStyles[badgeColor]
          )}
        >
          {badgeCount} {badgeLabel}
        </Badge>
      )}

      <div className="flex items-center gap-4">
        <Icon className="w-8 h-8 text-zinc-400 group-hover:text-amber-400 transition-colors" />
        <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
      </div>
      <p className="text-sm text-zinc-300 mt-2 flex-grow">{description}</p>
      <div className="mt-3 w-full rounded-xl bg-zinc-800/60 border border-zinc-700/50 py-2 text-center text-xs font-bold tracking-widest text-zinc-100">
        OPEN
      </div>
    </Link>
  );
}
