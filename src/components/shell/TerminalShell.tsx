import React from 'react';
import SystemRail from '@/components/system/SystemRail';
import BottomNav from './BottomNav';

export default function TerminalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <SystemRail />
      <main className="flex-1 pt-16 pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
