
import React from 'react';
import SystemRail from './SystemRail';
import BottomNav from './BottomNav';

export default function TerminalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <SystemRail />
      <main className="flex-1 pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 py-4">
            {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
