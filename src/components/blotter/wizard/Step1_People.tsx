"use client";

import { BlotterCase } from "@/app/blotter/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera } from "lucide-react";

interface StepProps {
    caseData: Partial<BlotterCase>;
    onUpdate: (data: Partial<BlotterCase>) => void;
}

export default function Step1People({ caseData, onUpdate }: StepProps) {

    const handleComplainantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate({ people: { ...caseData.people, complainant: { ...caseData.people?.complainant, name: e.target.value } } });
    }
    
    const handleRespondentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate({ people: { ...caseData.people, respondent: { ...caseData.people?.respondent, name: e.target.value } } });
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 h-full">
            <div className="space-y-6">
                <h2 className="text-3xl font-bold text-blue-400">Complainant (Nagrereklamo)</h2>
                <Button className="w-full h-20 bg-gray-700 hover:bg-gray-600 text-lg">
                    <Camera className="mr-4 h-8 w-8" /> Scan ID
                </Button>
                <div className="text-center text-gray-400">OR</div>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="complainant-name" className="text-xl">Full Name</Label>
                        <Input 
                            id="complainant-name" 
                            className="h-16 text-2xl mt-2 bg-black border-gray-600" 
                            placeholder="e.g., Maria Santos" 
                            value={caseData.people?.complainant?.name}
                            onChange={handleComplainantChange}
                        />
                    </div>
                     <div>
                        <Label htmlFor="complainant-address" className="text-xl">Address</Label>
                        <Input id="complainant-address" className="h-16 text-2xl mt-2 bg-black border-gray-600" placeholder="e.g., Purok 1, Brgy. Central" />
                    </div>
                </div>
            </div>
             <div className="space-y-6">
                <h2 className="text-3xl font-bold text-orange-400">Respondent (Inirereklamo)</h2>
                 <Button className="w-full h-20 bg-gray-700 hover:bg-gray-600 text-lg">
                    <Camera className="mr-4 h-8 w-8" /> Scan ID
                </Button>
                <div className="text-center text-gray-400">OR</div>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="respondent-name" className="text-xl">Full Name</Label>
                        <Input 
                            id="respondent-name" 
                            className="h-16 text-2xl mt-2 bg-black border-gray-600" 
                            placeholder="e.g., Juan Dela Cruz" 
                            value={caseData.people?.respondent?.name}
                            onChange={handleRespondentChange}
                        />
                    </div>
                     <div>
                        <Label htmlFor="respondent-address" className="text-xl">Address</Label>
                        <Input id="respondent-address" className="h-16 text-2xl mt-2 bg-black border-gray-600" placeholder="e.g., Purok 2, Brgy. Central" />
                    </div>
                </div>
            </div>
        </div>
    )
}
