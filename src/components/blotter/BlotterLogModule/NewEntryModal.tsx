
"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Step1People from './Step1_People';
import Step2Incident from './Step2_Incident';
import Step3Narrative from './Step3_Narrative';
import { Save } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { blotterCaseConverter, type BlotterCase, type Resident } from '@/lib/firebase/schema';

interface NewEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
}

const steps = ['The People', 'The Incident', 'The Narrative'];

const NewEntryModal = ({ isOpen, onClose, isOnline }: NewEntryModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<BlotterCase & { complainant?: Resident | { fullName: string }, respondent?: Resident | { fullName: string } }>>({});
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

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
    if ('displayName' in person) return person.displayName;
    if ('fullName' in person) return person.fullName;
    return 'Unknown';
  }

  const handleSave = async () => {
    setIsSaving(true);
    toast({
        title: "Filing Case...",
        description: "Saving the blotter case to the database.",
    });

    try {
        const { date, time, ...restOfData } = formData as any;
        
        const incidentDateTime = new Date(`${date}T${time}`);
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

        const blotterRef = collection(db, 'blotter_cases').withConverter(blotterCaseConverter);
        await addDoc(blotterRef, newCase);

        toast({
            title: "Case Filed Successfully!",
            description: `Case #${newCase.caseId} has been saved.`,
        });

        setFormData({});
        setCurrentStep(1);
        onClose();

    } catch (error) {
        console.error("Error adding blotter case: ", error);
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "Could not save the case. Please try again.",
        });
    } finally {
        setIsSaving(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1People formData={formData} setFormData={setFormData} />;
      case 2:
        return <Step2Incident formData={formData} setFormData={setFormData} />;
      case 3:
        return <Step3Narrative formData={formData} setFormData={setFormData} isOnline={isOnline} />;
      default:
        return null;
    }
  };
  
  const resetAndClose = () => {
    setFormData({});
    setCurrentStep(1);
    onClose();
  }


  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle className="text-2xl">New Blotter Entry - Step {currentStep}: {steps[currentStep - 1]}</DialogTitle>
        </DialogHeader>
        
        <div className="py-6">
          {renderStepContent()}
        </div>

        <DialogFooter className="justify-between mt-4">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" className="h-12 text-lg" onClick={handleBack} disabled={isSaving}>
                Back
              </Button>
            )}
          </div>
          <div>
            {currentStep < steps.length ? (
              <Button className="h-12 text-lg" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button className="bg-blue-600 hover:bg-blue-700 h-12 text-lg" onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-5 w-5" />
                {isSaving ? "Saving..." : "Save Record"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewEntryModal;
