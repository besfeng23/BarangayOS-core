"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BlotterDashboard from '@/components/blotter/dashboard/BlotterDashboard';
import IntakeWizard from '@/components/blotter/wizard/IntakeWizard';

export type BlotterView = 'dashboard' | 'wizard';
export type CaseStatus = 'MEDIATION' | 'CONCILIATION' | 'SETTLED' | 'CFA_ISSUED' | 'ARCHIVED';

export interface BlotterCase {
  id: string;
  caseNumber: string;
  status: CaseStatus;
  incidentType: string;
  isSensitive: boolean;
  narrative: string;
  dates: {
    incidentDate: Date;
    reportedDate: Date;
    lastHearingDate: Date;
    deadlineDate: Date;
  };
  people: {
    complainant: { name: string; idPhotoUrl?: string };
    respondent: { name: string; address?: string };
  };
  hearingLog: { date: Date; outcome: 'APPEARED' | 'NO_SHOW' | 'SETTLED' }[];
}


export default function BlotterPage() {
  const [view, setView] = useState<BlotterView>('dashboard');
  const [selectedCase, setSelectedCase] = useState<BlotterCase | null>(null);

  const handleNewCase = () => {
    setSelectedCase(null);
    setView('wizard');
  };

  const handleViewCase = (caseData: BlotterCase) => {
    setSelectedCase(caseData);
    // You would navigate to a case detail page here
    // For now, let's log it to the console
    console.log("Viewing case:", caseData);
  };
  
  const handleExitWizard = () => {
    setView('dashboard');
  }

  const handleSaveCase = (newCase: Omit<BlotterCase, 'id' | 'caseNumber'>) => {
    // In a real app, you'd save this to Firestore and your local cache.
    console.log("Saving new case:", newCase);
    const mockId = `case_${Date.now()}`;
    const mockCaseNumber = `2025-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    // Add to mock data source if you have one
    
    setView('dashboard');
  };


  return (
    <div className="relative min-h-screen bg-[#121212] text-white font-body">
      {view === 'dashboard' ? (
        <BlotterDashboard onViewCase={handleViewCase} />
      ) : (
        <IntakeWizard onExit={handleExitWizard} onSave={handleSaveCase} />
      )}

      {view === 'dashboard' && (
        <Button
          onClick={handleNewCase}
          className="fixed bottom-8 right-8 w-20 h-20 rounded-full bg-[#2563EB] hover:bg-[#2563EB]/90 shadow-lg text-white"
        >
          <Plus className="w-10 h-10" />
          <span className="sr-only">New Case</span>
        </Button>
      )}
    </div>
  );
}
