"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import BlotterHeader from '@/components/blotter/BlotterHeader';
import Stepper from '@/components/blotter/Stepper';
import ClassificationStep from '@/components/blotter/steps/ClassificationStep';
import ComplainantStep from '@/components/blotter/steps/ComplainantStep';
import RespondentStep from '@/components/blotter/steps/RespondentStep';
import NarrativeStep from '@/components/blotter/steps/NarrativeStep';
import ReviewStep from '@/components/blotter/steps/ReviewStep';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Jurisdiction = 'barangay' | 'pnp';
export type IncidentType = 'Amicable' | 'VAWC' | 'Rape' | 'Theft' | 'Other';

const steps = [
  'Classification',
  'Complainant',
  'Respondent',
  'Narrative',
  'Review',
];

export default function BlotterPage() {
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>('barangay');
  const [currentStep, setCurrentStep] = useState(1);
  const [incidentType, setIncidentType] = useState<IncidentType | ''>('');
  const [isPinkBlotter, setIsPinkBlotter] = useState(false);

  useEffect(() => {
    const isPink = incidentType === 'VAWC' || incidentType === 'Rape';
    setIsPinkBlotter(isPink);
    document.body.classList.toggle('pink-blotter', isPink);
  }, [incidentType]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ClassificationStep
            incidentType={incidentType}
            onIncidentTypeChange={setIncidentType}
            jurisdiction={jurisdiction}
          />
        );
      case 2:
        return <ComplainantStep />;
      case 3:
        return <RespondentStep />;
      case 4:
        return <NarrativeStep />;
      case 5:
        return <ReviewStep />;
      default:
        return <div>Unknown Step</div>;
    }
  };
  
  const handleNext = () => {
      if (currentStep < steps.length) {
          setCurrentStep(currentStep + 1);
      }
  };

  const handleBack = () => {
      if (currentStep > 1) {
          setCurrentStep(currentStep - 1);
      }
  };


  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-body">
      <BlotterHeader
        jurisdiction={jurisdiction}
        onJurisdictionChange={setJurisdiction}
      />
      
      {isPinkBlotter && (
        <div className="bg-pink-600 text-white text-center py-2 text-sm font-bold">
            <TriangleAlert className="inline-block mr-2 h-4 w-4" />
            STRICT CONFIDENTIALITY: This is a VAWC/Rape case. Handle with extreme care.
        </div>
      )}

      <main className="flex-1 grid md:grid-cols-[280px_1fr] min-h-0">
        <aside className="border-r border-border p-6 hidden md:block">
          <Link href="/" passHref>
             <Button variant="outline" className="mb-8 w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Hub
            </Button>
          </Link>
          <Stepper steps={steps} currentStep={currentStep} />
        </aside>

        <div className="flex flex-col overflow-y-auto">
          <div className="flex-1 p-6 sm:p-8 lg:p-10 space-y-8">
            {renderStepContent()}
          </div>
          <div className="p-6 border-t border-border bg-background/80 backdrop-blur-lg sticky bottom-0">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
              <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
                Back
              </Button>
              <Button onClick={handleNext} disabled={currentStep === steps.length}>
                Next
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
