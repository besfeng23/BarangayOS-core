import React from "react";
import SystemRail from "@/components/shell/SystemRail";
import BottomNav from "@/components/app-hub/BottomNav";
import { systemFlags } from "@/lib/systemFlags";

export function TerminalShell({ children }: { children: React.ReactNode }) {
  const { isTrial, trialDaysRemaining } = systemFlags;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="sticky top-0 z-40">
        <SystemRail />
      </div>

      {/* Content */}
      <main className="pb-24">{children}</main>

      {/* Trial Banner */}
      {isTrial && (
        <div
          className="fixed left-0 right-0 bottom-[64px] h-8 z-40 bg-yellow-400 text-black text-xs font-black
            flex items-center justify-center border-t border-yellow-300"
          role="status"
          aria-live="polite"
        >
          TRIAL MODE: {trialDaysRemaining} Days Remaining
        </div>
      )}

      <BottomNav />
    </div>
  );
}
