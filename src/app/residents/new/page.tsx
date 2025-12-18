"use client";
import ResidentWizard from "@/features/residents/ResidentWizard";
import TerminalShell from "@/components/shell/TerminalShell";

export default function Page() {
    return (
        <TerminalShell>
            <p className="text-xs text-zinc-500">UX-V2-ACTIVE</p>
            <ResidentWizard mode="create" />
        </TerminalShell>
    );
}
