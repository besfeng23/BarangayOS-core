import * as React from "react";
import { Outlet } from "react-router-dom";
import SystemRail from "../components/SystemRail";
import BottomNav from "../components/BottomNav";
import { TerminalUIProvider } from "../contexts/TerminalUIContext";

export default function TerminalShell() {
  return (
    <TerminalUIProvider>
      <div className="h-[100svh] w-full bg-zinc-950 text-zinc-100 flex flex-col font-sans overflow-hidden">
        <SystemRail />

        <main className="flex-1 overflow-hidden relative pb-[calc(80px+env(safe-area-inset-bottom)+16px)]">
          <Outlet />
        </main>

        <BottomNav />
      </div>
    </TerminalUIProvider>
  );
}
