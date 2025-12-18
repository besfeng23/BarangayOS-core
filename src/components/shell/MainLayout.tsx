
import React from 'react';
import { StatusIndicator } from '@/components/shell/StatusIndicator';
import { TrialBanner } from '@/components/shell/TrialBanner';
import { SettingsDropdown } from '@/components/shell/SettingsDropdown';

export default function MainLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-zinc-900 border-b border-zinc-800">
        <div className="h-full max-w-6xl mx-auto px-4 flex items-center gap-3">
            BOS
          <div className="flex-1" />
          <StatusIndicator />
          <SettingsDropdown />
        </div>
      </header>
      <main className="pt-16 pb-10">{children}</main>
      <TrialBanner />
    </div>
  );
}
