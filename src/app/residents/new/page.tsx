
"use client";
import ResidentWizard from "@/features/residents/ResidentWizard";
import TerminalShell from "@/components/shell/TerminalShell";

export default function Page() {
    return (
        <TerminalShell>
            <div className="max-w-2xl mx-auto px-4">
                 <ResidentWizard mode="create" />
            </div>
        </TerminalShell>
    );
}

    