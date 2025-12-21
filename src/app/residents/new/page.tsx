
"use client";
import ResidentWizard from "@/features/residents/ResidentWizard";

export default function Page() {
    return (
        <div className="max-w-2xl mx-auto px-4">
              <ResidentWizard mode="create" />
        </div>
    );
}
