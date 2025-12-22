import React from 'react';
import SystemRail from '@/components/shell/SystemRail';
import BottomNav from './BottomNav';

export default function TerminalShell({ children, onHelpClick }: { children: React.ReactNode, onHelpClick?: () => void }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SystemRail onHelpClick={onHelpClick} />
      <main className="flex-1 pt-16 sm:pb-20">
        {children}
      </main>
      <div className="sm:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
