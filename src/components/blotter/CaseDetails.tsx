"use client";

import { BlotterCase } from "@/app/blotter/page";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { differenceInDays, isBefore } from 'date-fns';

const STAGES = ['MEDIATION', 'CONCILIATION', 'RESOLUTION'];

interface CaseDetailsProps {
    caseData: BlotterCase;
}

export default function CaseDetails({ caseData }: CaseDetailsProps) {
    const { status, dates, hearingLog } = caseData;
    const currentStageIndex = STAGES.indexOf(status === 'SETTLED' || status === 'CFA_ISSUED' || status === 'ARCHIVED' ? 'RESOLUTION' : status);
    
    const noShowCount = hearingLog.filter(log => log.outcome === 'NO_SHOW').length;
    const isCfaButtonDisabled = () => {
        if (status !== 'CONCILIATION') return true;
        const isPastDeadline = isBefore(new Date(), dates.deadlineDate);
        return isPastDeadline && noShowCount < 2;
    };
    
    const daysLeft = differenceInDays(dates.deadlineDate, new Date());


    const renderActionButtons = () => {
        switch (status) {
            case 'MEDIATION':
                return (
                    <>
                        <Button className="bg-blue-600 hover:bg-blue-700 h-16 text-lg">PRINT SUMMONS (KP Form 7)</Button>
                        <Button className="bg-green-600 hover:bg-green-700 h-16 text-lg">MARK AS SETTLED</Button>
                        <Button className="bg-yellow-600 hover:bg-yellow-700 h-16 text-lg">NO SHOW</Button>
                        <div className="text-center text-xl font-bold text-yellow-400">
                            Days Left: {daysLeft > 0 ? daysLeft : 0}
                        </div>
                    </>
                );
            case 'CONCILIATION':
                 return (
                    <>
                        <Button className="bg-blue-600 hover:bg-blue-700 h-16 text-lg">PRINT HEARING NOTICE</Button>
                        <Button className="bg-red-600 hover:bg-red-700 h-16 text-lg" disabled={isCfaButtonDisabled()}>ISSUE CFA</Button>
                         <p className="text-xs text-center text-gray-400">
                           {isCfaButtonDisabled() ? `CFA can be issued after ${dates.deadlineDate.toLocaleDateString()} or after 2 'No Shows'.` : 'Certificate to File Action can now be issued.'}
                        </p>
                    </>
                );
            case 'SETTLED':
                return <Button className="bg-blue-600 hover:bg-blue-700 h-16 text-lg">PRINT AGREEMENT (KP Form 16)</Button>;
            default:
                return <p className="text-gray-400 text-center">No actions available for this case status.</p>;
        }
    }

    return (
        <div className="p-8 space-y-8 bg-[#1e1e1e] rounded-lg">
            <div>
                <h2 className="text-xl font-bold mb-4">Case Progress</h2>
                <div className="flex items-center gap-4">
                    {STAGES.map((stage, index) => (
                        <div key={stage} className={`flex-1 text-center ${index <= currentStageIndex ? 'text-blue-400' : 'text-gray-500'}`}>
                            {stage}
                        </div>
                    ))}
                </div>
                <Progress value={(currentStageIndex + 1) / STAGES.length * 100} className="h-4 mt-2" />
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-bold">Details</h2>
                <div className="grid grid-cols-2 gap-4 text-lg">
                    <div><strong className="text-gray-400">Case #:</strong > {caseData.caseNumber}</div>
                    <div><strong className="text-gray-400">Type:</strong> {caseData.incidentType}</div>
                    <div><strong className="text-gray-400">Complainant:</strong> {caseData.isSensitive ? 'M**** S*****' : caseData.people.complainant.name}</div>
                    <div><strong className="text-gray-400">Respondent:</strong> {caseData.people.respondent.name}</div>
                    <div><strong className="text-gray-400">Incident Date:</strong> {caseData.dates.incidentDate.toLocaleDateString()}</div>
                    <div><strong className="text-gray-400">Reported Date:</strong> {caseData.dates.reportedDate.toLocaleDateString()}</div>
                </div>
                <div>
                     <strong className="text-gray-400">Narrative:</strong>
                     <p className="mt-1 text-lg bg-black p-4 rounded-md">{caseData.narrative}</p>
                </div>
            </div>
             <div className="space-y-4">
                 <h2 className="text-xl font-bold">Actions</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {renderActionButtons()}
                 </div>
            </div>
        </div>
    )
}
