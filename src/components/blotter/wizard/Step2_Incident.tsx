"use client";

import { BlotterCase } from "@/app/blotter/page";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StepProps {
    caseData: Partial<BlotterCase>;
    onUpdate: (data: Partial<BlotterCase>) => void;
}

const INCIDENT_TYPES = [
    'Noise Complaint', 'Physical Injury', 'Theft', 'Utang (Debt)', 'Property Damage', 'Other'
];

export default function Step2Incident({ caseData, onUpdate }: StepProps) {
    const handleSelectType = (type: string) => {
        onUpdate({ incidentType: type });
    }

    return (
        <div className="flex flex-col items-center justify-center h-full">
             <h2 className="text-3xl font-bold mb-12">What is the incident about?</h2>
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 w-full max-w-4xl">
                {INCIDENT_TYPES.map(type => (
                    <Button 
                        key={type}
                        onClick={() => handleSelectType(type)}
                        className={cn(
                            "h-24 text-2xl bg-gray-800 border-2 border-gray-700 hover:bg-gray-700 hover:border-blue-500",
                            caseData.incidentType === type && "bg-blue-600 border-blue-400"
                        )}
                    >
                        {type}
                    </Button>
                ))}
             </div>
        </div>
    )
}
