
"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Step1Business from './Step1_Business';
import Step2Details from './Step2_Details';
import Step3Financials from './Step3_Financials';
import PrintReceiptModal from './PrintReceiptModal';
import type { ApplicationReceipt } from '@/types/permits';

interface NewApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = ['Business Identification', 'Permit Details', 'Financials & Finalization'];

const NewApplicationModal = ({ isOpen, onClose }: NewApplicationModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<ApplicationReceipt | null>(null);
  const { toast } = useToast();

  const handleNext = () => {
    // In a real app, you'd add validation here
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
    // Add save logic here (e.g., write to Firestore)
    // Create mock receipt data for now
    const mockReceipt: ApplicationReceipt = {
      applicationId: `APP-${Date.now()}`,
      businessName: (formData as any).businessName || 'N/A',
      ownerName: (formData as any).ownerName || 'N/A',
      applicationType: (formData as any).permitType || 'NEW',
      dateApplied: new Date().toLocaleDateString(),
      preliminaryFees: parseFloat((formData as any).totalFees) || 0,
      notes: (formData as any).notes || '',
      receivedBy: "John Doe (Treasurer)", // Mock user
    };
    setReceiptData(mockReceipt);
    
    toast({
        title: "Application Saved for Review",
        description: "The new business permit application has been saved.",
    });

    onClose(); // Close the entry modal
    setIsPrintModalOpen(true); // Open the print preview modal
  };
  
  const resetFlow = () => {
    setCurrentStep(1);
    setFormData({});
    onClose();
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1Business formData={formData} setFormData={setFormData} />;
      case 2:
        return <Step2Details formData={formData} setFormData={setFormData} />;
      case 3:
        return <Step3Financials formData={formData} setFormData={setFormData} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={resetFlow}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle className="text-2xl">New Permit Application - Step {currentStep}: {steps[currentStep - 1]}</DialogTitle>
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
                  Save for Review & Print Receipt
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {receiptData && (
        <PrintReceiptModal 
            isOpen={isPrintModalOpen}
            onClose={() => setIsPrintModalOpen(false)}
            receiptData={receiptData}
        />
      )}
    </>
  );
};

export default NewApplicationModal;
