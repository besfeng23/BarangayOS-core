"use client";

import { useState } from 'react';
import BlotterHeader from "@/components/blotter/BlotterHeader";
import ActionCard from "./ActionCard";
import CaseList from "./CaseList";
import { BlotterCase } from '@/app/blotter/page';
import { addDays, subDays } from 'date-fns';

const MOCK_CASES: BlotterCase[] = [
  {
    id: '1',
    caseNumber: '2025-001',
    status: 'MEDIATION',
    incidentType: 'Noise Complaint',
    isSensitive: false,
    narrative: 'Loud karaoke every night.',
    dates: {
      incidentDate: subDays(new Date(), 5),
      reportedDate: subDays(new Date(), 2),
      lastHearingDate: subDays(new Date(), 2),
      deadlineDate: addDays(new Date(), 2),
    },
    people: {
      complainant: { name: 'Maria Santos' },
      respondent: { name: 'Juan Dela Cruz' },
    },
    hearingLog: [],
  },
  {
    id: '2',
    caseNumber: '2025-002',
    status: 'SETTLED',
    incidentType: 'Utang (Debt)',
    isSensitive: false,
    narrative: 'Unpaid debt of 500 pesos.',
    dates: {
      incidentDate: subDays(new Date(), 20),
      reportedDate: subDays(new Date(), 18),
      lastHearingDate: subDays(new Date(), 10),
      deadlineDate: subDays(new Date(), 3),
    },
    people: {
      complainant: { name: 'Pedro Penduko' },
      respondent: { name: 'Jose Rizal' },
    },
    hearingLog: [{ date: subDays(new Date(), 10), outcome: 'SETTLED' }],
  },
   {
    id: '3',
    caseNumber: '2025-003',
    status: 'CFA_ISSUED',
    incidentType: 'Domestic Issue',
    isSensitive: true,
    narrative: 'Confidential details recorded.',
    dates: {
      incidentDate: subDays(new Date(), 30),
      reportedDate: subDays(new Date(), 28),
      lastHearingDate: subDays(new Date(), 15),
      deadlineDate: subDays(new Date(), 13),
    },
    people: {
      complainant: { name: 'Juana C.' },
      respondent: { name: 'Andres B.' },
    },
    hearingLog: [
        { date: subDays(new Date(), 20), outcome: 'NO_SHOW' },
        { date: subDays(new Date(), 15), outcome: 'NO_SHOW' }
    ],
  },
];


interface BlotterDashboardProps {
    onViewCase: (caseData: BlotterCase) => void;
}

export default function BlotterDashboard({ onViewCase }: BlotterDashboardProps) {
  const [cases, setCases] = useState<BlotterCase[]>(MOCK_CASES);

  const urgentCases = cases.filter(c => {
      const daysUntilDeadline = (c.dates.deadlineDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24);
      return daysUntilDeadline <= 3 && daysUntilDeadline >= 0 && (c.status === 'MEDIATION' || c.status === 'CONCILIATION');
  });

  return (
    <div className="flex flex-col h-full">
      <BlotterHeader title="Blotter Log" />
      <main className="flex-1 p-6 space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-4">Action Required</h2>
          <div className="flex space-x-6 overflow-x-auto pb-4 -mb-4">
             {urgentCases.length > 0 ? (
                urgentCases.map(c => <ActionCard key={c.id} caseData={c} />)
             ) : (
                <div className="text-gray-400 h-[180px] flex items-center">No cases require immediate action.</div>
             )}
          </div>
        </section>
        <section>
            <h2 className="text-xl font-bold mb-4">All Cases</h2>
            <CaseList cases={cases} onViewCase={onViewCase} />
        </section>
      </main>
    </div>
  );
}
