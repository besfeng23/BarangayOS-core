
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
import type { ApplicationReceipt, BusinessPermit as AppBusinessPermit } from '@/types/permits';
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { businessPermitConverter, type BusinessPermit } from '@/lib/firebase/schema';


interface NewApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = ['Business Identification', 'Permit Details', 'Financials & Finalization'];

const NewApplicationModal = ({ isOpen, onClose }: NewApplicationModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<AppBusinessPermit>>({});
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<ApplicationReceipt | null>(null);
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = async () => {
    setIsSaving(true);
    toast({
        title: "Saving Application...",
        description: "Submitting new business permit application for review.",
    });

    try {
        const newPermitData: Omit<BusinessPermit, 'id' | 'createdAt' | 'updatedAt'> = {
            permitNo: `BP-DRAFT-${Date.now()}`,
            applicationType: formData.applicationType || 'NEW',
            status: 'PENDING_REVIEW',
            businessName: formData.businessName || 'N/A',
            businessAddress: {
                purok: (formData.businessAddress as any)?.purok || 'N/A', // Simplified for now
                street: (formData.businessAddress as any)?.street || '',
                barangay: 'Dau',
                city: 'Mabalacat',
                province: 'Pampanga'
            },
            owner: {
                fullName: (formData.owner as any)?.fullName || 'N/A',
                contactNo: (formData.owner as any)?.contactNo || '',
                address: '' // Simplified
            },
            filedAt: Timestamp.fromDate(new Date(formData.filedAt as any) || new Date()),
            validFrom: Timestamp.fromDate(new Date()), // Placeholder
            validUntil: Timestamp.fromDate(new Date(new Date().setFullYear(new Date().getFullYear() + 1))), // Placeholder
            payment: {
                status: 'UNPAID',
            },
            totals: {
                subtotal: parseFloat((formData.totals as any)?.totalFees) || 0,
                penalties: 0,
                discounts: 0,
                total: parseFloat((formData.totals as any)?.totalFees) || 0,
            },
            barangayId: "TEST-BARANGAY-1",
            createdByUid: "SECRETARY-DEVICE-1",
            // fields that are not in the form but required by schema
            category: formData.category || 'Other',
            requirements: [],
            fees: [],
            flags: [],
        };

        const permitsRef = collection(db, 'business_permits').withConverter(businessPermitConverter);
        const docRef = await addDoc(permitsRef, newPermitData);

        const mockReceipt: ApplicationReceipt = {
            applicationId: docRef.id,
            businessName: newPermitData.businessName,
            ownerName: newPermitData.owner.fullName,
            applicationType: newPermitData.applicationType,
            dateApplied: new Date().toLocaleDateString(),
            preliminaryFees: newPermitData.totals.total,
            notes: (formData as any).notes || '',
            receivedBy: "John Doe (Treasurer)", // Mock user
        };
        setReceiptData(mockReceipt);

        toast({
            title: "Application Saved for Review",
            description: `Application for ${newPermitData.businessName} has been submitted.`,
        });

        resetFlow(true); // Keep modal open for print preview
        setIsPrintModalOpen(true); // Open the print preview modal
    
    } catch (error) {
        console.error("Error saving permit:", error);
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "Could not save the new application. Please try again.",
        });
    } finally {
        setIsSaving(false);
    }
  };
  
  const resetFlow = (keepOpen = false) => {
    setCurrentStep(1);
    setFormData({});
    if (!keepOpen) {
      onClose();
    }
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
      <Dialog open={isOpen} onOpenChange={() => resetFlow()}>
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
                <Button variant="outline" className="h-12 text-lg" onClick={handleBack} disabled={isSaving}>
                  Back
                </Button>
              )}
            </div>
            <div>
              {currentStep < steps.length ? (
                <Button className="h-12 text-lg" onClick={handleNext} disabled={isSaving}>
                  Next
                </Button>
              ) : (
                <Button className="bg-blue-600 hover:bg-blue-700 h-12 text-lg" onClick={handleSave} disabled={isSaving}>
                  <Save className="mr-2 h-5 w-5" />
                  {isSaving ? 'Saving...' : 'Save for Review & Print Receipt'}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {receiptData && (
        <PrintReceiptModal 
            isOpen={isPrintModalOpen}
            onClose={() => {
                setIsPrintModalOpen(false);
                resetFlow(); // Fully close and reset original modal
            }}
            receiptData={receiptData}
        />
      )}
    </>
  );
};

export default NewApplicationModal;
