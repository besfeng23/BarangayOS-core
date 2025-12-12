
"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Step1People from './Step1_People';
import Step2Incident from './Step2_Incident';
import Step3Narrative from './Step3_Narrative';
import { Save } from 'lucide-react';

interface NewEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = ['The People', 'The Incident', 'The Narrative'];

const NewEntryModal = ({ isOpen, onClose }: NewEntryModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});

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
    console.log("Saving data:", formData);
    // Add save logic here (e.g., write to Firebase)
    onClose(); // Close modal after save
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1People formData={formData} setFormData={setFormData} />;
      case 2:
        return <Step2Incident formData={formData} setFormData={setFormData} />;
      case 3:
        return <Step3Narrative formData={formData} setFormData={setFormData} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle className="text-2xl">New Blotter Entry - Step {currentStep}: {steps[currentStep - 1]}</DialogTitle>
        </DialogHeader>
        
        <div className="py-6">
          {renderStepContent()}
        </div>

        <DialogFooter className="justify-between mt-4">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" className="h-12 text-lg" onClick={handleBack}>
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
              <Button className="bg-blue-600 hover:bg-blue-700 h-12 text-lg" onClick={handleSave}>
                <Save className="mr-2 h-5 w-5" />
                Save Record
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewEntryModal;
