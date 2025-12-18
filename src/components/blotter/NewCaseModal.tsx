"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from "@/components/ui/toast";
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { blotterCaseConverter, type BlotterCase, type Resident } from '@/lib/firebase/schema';
import WorkflowShell from '../system/WorkflowShell';
import StickyActionBar from '../system/StickyActionBar';
import { Save } from 'lucide-react';
import Step1People from './BlotterLogModule/Step1_People';
import Step2Incident from './BlotterLogModule/Step2_Incident';
import Step3Narrative from './BlotterLogModule/Step3_Narrative';
import ActionResultModal from '../system/ActionResultModal';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

interface NewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = ['The People', 'The Incident', 'The Narrative'];

const NewCaseModal = ({ isOpen, onClose }: NewCaseModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<BlotterCase & { complainant?: Resident | { fullName: string }, respondent?: Resident | { fullName: string } }>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [saveResult, setSaveResult] = useState<{ ok: boolean; message: string; statusLine: string } | null>(null);
  const isOnline = useOnlineStatus();
  const { toast } = useToast();

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

  const getFullName = (person: Resident | { fullName: string } | undefined): string => {
    if (!person) return 'Unknown';
    if ('displayName' in person && person.displayName) return person.displayName;
    if ('fullName' in person && person.fullName) return person.fullName;
    return 'Unknown';
  }

  const handleSave = async () => {
    setIsSaving(true);
    toast({ title: "Filing Case...", description: "Saving the blotter case locally." });

    try {
        const { date, time, ...restOfData } = formData as any;

        if (!date || date.trim() === '') {
            throw new Error("Missing Incident Date. Please go back and select a date.");
        }
        
        const incidentDateTime = new Date(`${date}T${time || '00:00'}`);
        const incidentAt = Timestamp.fromDate(incidentDateTime);

        const newCase: Omit<BlotterCase, 'id' | 'createdAt' | 'updatedAt'> = {
            caseId: `BC-${Date.now()}`,
            complainant: getFullName(formData.complainant),
            respondent: getFullName(formData.respondent),
            nature: formData.nature || 'Not Specified',
            narrative: formData.narrative || '',
            status: 'ACTIVE',
            incidentAt: incidentAt,
            date: formData.date!,
            barangayId: "TEST-BARANGAY-1",
            createdBy: "SECRETARY-DEVICE-1",
        };
        
        // This simulates saving locally first.
        // In a real Dexie implementation, this would be an offline-first DB write.
        const blotterRef = collection(db, 'blotter_cases').withConverter(blotterCaseConverter);
        await addDoc(blotterRef, newCase);
        
        setSaveResult({ 
            ok: true, 
            message: `Case #${newCase.caseId} has been saved locally.`,
            statusLine: isOnline ? "Synced with server." : "Queued for sync."
        });

    } catch (error: any) {
        console.error("Error adding blotter case: ", error);
        setSaveResult({ 
            ok: false, 
            message: "Could not save the case.",
            statusLine: error.message || "An unexpected error occurred."
        });
    } finally {
        setIsSaving(false);
        setShowResultModal(true);
    }
  };

  const isNextDisabled = () => {
    if (currentStep === 1) {
        return !formData.complainant || !formData.respondent;
    }
    if (currentStep === 2) {
        return !formData.nature || !formData.date;
    }
    return false;
  }

  const resetAndClose = () => {
    setFormData({});
    setCurrentStep(1);
    onClose();
    setShowResultModal(false);
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={resetAndClose}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-4xl w-full flex flex-col h-[90vh] p-0">
          <WorkflowShell
            title="New Blotter Entry"
            steps={steps}
            currentStep={currentStep}
          >
            <div className="py-6 px-6 flex-grow overflow-y-auto">
              <p className="text-xs text-zinc-500">UX-V2-ACTIVE</p>
              {
                {
                  1: <Step1People formData={formData} setFormData={setFormData} />,
                  2: <Step2Incident formData={formData} setFormData={setFormData} />,
                  3: <Step3Narrative formData={formData} setFormData={setFormData} isOnline={isOnline} />
                }[currentStep]
              }
            </div>
          </WorkflowShell>
          
          <StickyActionBar>
            <button
                onClick={handleBack}
                disabled={isSaving || currentStep === 1}
                className="px-5 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 font-semibold disabled:opacity-50"
            >
                Back
            </button>
            {currentStep < steps.length ? (
              <button onClick={handleNext} disabled={isNextDisabled()} className="px-5 py-3 rounded-xl bg-blue-600 text-white font-bold disabled:opacity-50">
                Next
              </button>
            ) : (
              <button className="px-5 py-3 rounded-xl bg-blue-600 text-white font-bold disabled:opacity-50" onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-5 w-5 inline-block" />
                {isSaving ? "Saving..." : "Save Record"}
              </button>
            )}
          </StickyActionBar>
        </DialogContent>
      </Dialog>
      
      {saveResult && (
          <ActionResultModal
              isOpen={showResultModal}
              onClose={resetAndClose}
              result={saveResult}
              onRetry={handleSave}
              retryText="Retry Save"
              primaryActionText="Log Another Case"
              onPrimaryAction={resetAndClose}
          />
      )}
    </>
  );
};

export default NewCaseModal;
