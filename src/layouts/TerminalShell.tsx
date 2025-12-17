import * as React from "react";
import SystemRail from "../components/SystemRail";
import BottomNav from "../components/BottomNav";
import { TerminalUIProvider } from "../contexts/TerminalUIContext";

export function TerminalShell({ children }: { children: React.ReactNode }) {
  return (
    <TerminalUIProvider>
      <div className="h-[100svh] w-full bg-zinc-950 text-zinc-100 flex flex-col font-sans overflow-hidden">
        <SystemRail />

        <main className="flex-1 overflow-y-auto relative pt-16 pb-[calc(80px+env(safe-area-inset-bottom)+16px)]">
          {children}
        </main>

        <BottomNav />
      </div>
    </TerminalUIProvider>
  );
}
