"use client";

import { BlotterCase } from "@/app/blotter/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StepProps {
    caseData: Partial<BlotterCase>;
}

export default function Step4Review({ caseData }: StepProps) {
    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Review Case Details</h2>
            <Card className="bg-[#1e1e1e] border-gray-700">
                <CardHeader>
                    <CardTitle className="text-2xl text-blue-400">Final Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-xl">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        <div>
                            <p className="text-gray-400">Complainant:</p>
                            <p>{caseData.people?.complainant?.name}</p>
                        </div>
                         <div>
                            <p className="text-gray-400">Respondent:</p>
                            <p>{caseData.people?.respondent?.name}</p>
                        </div>
                         <div>
                            <p className="text-gray-400">Incident Type:</p>
                            <p>{caseData.incidentType}</p>
                        </div>
                        <div>
                            <p className="text-gray-400">Is Sensitive:</p>
                            <p className={caseData.isSensitive ? 'text-pink-400 font-bold' : ''}>{caseData.isSensitive ? "Yes" : "No"}</p>
                        </div>
                    </div>
                     <div>
                        <p className="text-gray-400">Narrative:</p>
                        <p className="p-4 bg-black rounded-md mt-1 max-h-60 overflow-y-auto">{caseData.narrative || "No narrative provided."}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
