
"use client";
import ResidentWizard from "@/features/residents/ResidentWizard";
import { useSearchParams } from 'next/navigation';

export default function Page() {
    const searchParams = useSearchParams();
    
    // In a future version, this could pass initial data from a draft.
    const initialData = null;

    return (
        <div className="max-w-2xl mx-auto px-4">
              <ResidentWizard mode="create" />
        </div>
    );
}
