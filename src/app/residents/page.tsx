
"use client";
import ResidentsPage from "@/features/residents/ResidentsPage";
import TerminalShell from "@/components/shell/TerminalShell";

export default function Page() { 
  return (
    <TerminalShell>
      <ResidentsPage />
    </TerminalShell>
  );
}
