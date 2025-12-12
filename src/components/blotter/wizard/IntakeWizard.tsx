"use client";

import { useState } from 'react';
import BlotterHeader from '../BlotterHeader';
import { Button } from '@/components/ui/button';
import { BlotterCase } from '@/app/blotter/page';

import Step1People from './Step1_People';
import Step2Incident from './Step2_Incident';
import Step3Story from './Step3_Story';
import Step4Review from './Step4_Review';

const steps = ['The People', 'The Incident', 'The Story', 'Review & Save'];

interface IntakeWizardProps {
  onExit: () => void;
  onSave: (newCase: Omit<BlotterCase, 'id' | 'caseNumber'>) => void;
}

export default function IntakeWizard({ onExit, onSave }: IntakeWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [caseData, setCaseData] = useState<Partial<BlotterCase>>({
    status: 'MEDIATION',
    isSensitive: false,
    dates: {
        incidentDate: new Date(),
        reportedDate: new Date(),
        lastHearingDate: new Date(),
        deadlineDate: new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000),
    },
    people: {
        complainant: { name: '' },
        respondent: { name: '' },
    },
    hearingLog: [],
  });

  const updateCaseData = (update: Partial<BlotterCase>) => {
    setCaseData(prev => ({ ...prev, ...update }));
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
  
  const handleSave = () => {
    // Perform final validation before saving
    onSave(caseData as Omit<BlotterCase, 'id' | 'caseNumber'>);
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1People caseData={caseData} onUpdate={updateCaseData} />;
      case 2:
        return <Step2Incident caseData={caseData} onUpdate={updateCaseData} />;
      case 3:
        return <Step3Story caseData={caseData} onUpdate={updateCaseData} />;
      case 4:
        return <Step4Review caseData={caseData} />;
      default:
        return <div>Unknown Step</div>;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <BlotterHeader title={`New Case: ${steps[currentStep - 1]}`} />
      
      <div className="flex-1 p-6 sm:p-8 lg:p-12 overflow-y-auto">
        {renderStepContent()}
      </div>

      <footer className="p-4 border-t border-gray-700 bg-[#1e1e1e] flex items-center justify-between h-[80px]">
        <div>
            <Button variant="outline" onClick={onExit} className="h-14 text-lg px-8 bg-transparent border-gray-600 hover:bg-gray-700">
                Cancel
            </Button>
        </div>
        <div className="flex items-center gap-4">
             <div className="text-gray-400">{`Step ${currentStep} of ${steps.length}`}</div>
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 1} className="h-14 text-lg px-8 bg-transparent border-gray-600 hover:bg-gray-700">
                Back
            </Button>
            {currentStep === steps.length ? (
                 <Button onClick={handleSave} className="h-14 text-lg px-8 bg-blue-600 hover:bg-blue-700">
                    Save Record
                 </Button>
            ) : (
                <Button onClick={handleNext} className="h-14 text-lg px-8 bg-blue-600 hover:bg-blue-700">
                    Next
                </Button>
            )}
        </div>
      </footer>
    </div>
  );
}
