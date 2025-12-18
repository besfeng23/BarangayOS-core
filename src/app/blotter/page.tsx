"use client";
import BlotterPage from "@/features/blotter/BlotterPage";
import TerminalShell from "@/components/shell/TerminalShell";

export default function Page() { 
  return (
    <TerminalShell>
      <BlotterPage />
    </TerminalShell>
  );
}
