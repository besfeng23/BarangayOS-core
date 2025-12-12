"use client";

import { BlotterCase } from "@/app/blotter/page";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface StepProps {
    caseData: Partial<BlotterCase>;
    onUpdate: (data: Partial<BlotterCase>) => void;
}

export default function Step3Story({ caseData, onUpdate }: StepProps) {
    
    const handleNarrativeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onUpdate({ narrative: e.target.value });
    }
    
    const handleSensitivityChange = (checked: boolean) => {
        onUpdate({ isSensitive: checked });
    }

    return (
        <div className="max-w-4xl mx-auto h-full flex flex-col">
            <h2 className="text-3xl font-bold mb-6">Tell the Story</h2>
            <div className="flex-1 flex flex-col space-y-4">
                <Label htmlFor="narrative" className="text-xl">Narrative / Details of Incident</Label>
                <Textarea 
                    id="narrative" 
                    className="flex-1 text-xl bg-black border-gray-600 min-h-[300px]"
                    placeholder="Start writing the incident report here... Be detailed."
                    value={caseData.narrative}
                    onChange={handleNarrativeChange}
                />
            </div>
            <div className="mt-8 flex items-center justify-center space-x-4 p-4 rounded-lg bg-pink-900/20 border border-pink-800">
                <Label htmlFor="sensitive-case" className="text-2xl font-bold text-pink-400">
                    Confidential / Sensitive Case?
                </Label>
                <Switch 
                    id="sensitive-case" 
                    className="data-[state=checked]:bg-pink-500"
                    style={{ transform: 'scale(1.5)' }}
                    checked={caseData.isSensitive}
                    onCheckedChange={handleSensitivityChange}
                />
            </div>
        </div>
    )
}
