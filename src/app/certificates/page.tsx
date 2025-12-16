
'use client';

import React, { useState } from 'react';
import { ResidentPicker } from '@/components/residents/ResidentPicker';
import type { Resident } from '@/lib/firebase/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, User, FileText, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Transaction } from '@/types/transactions';
import PrintCertificateModal from '@/components/certificates/PrintCertificateModal';
import Link from 'next/link';

type CertificateType = 'Barangay Clearance' | 'Certificate of Indigency' | 'Certificate of Residency';

const CertificatesPage = () => {
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [certificateType, setCertificateType] = useState<CertificateType | ''>('');
  const [purpose, setPurpose] = useState('');
  const [fees, setFees] = useState('0.00');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Transaction | null>(null);


  const handleSaveAndPreview = async () => {
    if (!selectedResident || !certificateType || !purpose) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a resident, certificate type, and provide a purpose.",
      });
      return;
    }

    setIsSaving(true);
    toast({
      title: "Saving Certificate...",
      description: "Saving the record to the device. It will sync when online.",
    });

    try {
      const transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> = {
        barangayId: "TEST-BARANGAY-1",
        residentRef: selectedResident.id,
        residentNameSnapshot: selectedResident.displayName,
        type: certificateType,
        purpose: purpose,
        feesCollected: parseFloat(fees),
        officialSignee: "Hon. Juan Dela Cruz", // Mock Punong Barangay
        transactionDate: Timestamp.now(),
        status: 'COMPLETED',
        createdBy: "SECRETARY-DEVICE-1", // Mock User
      };

      const transactionsRef = collection(db, 'transactions');
      const docRef = await addDoc(transactionsRef, {
        ...transactionData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const finalTransaction: Transaction = {
          ...transactionData,
          id: docRef.id,
          createdAt: transactionData.transactionDate, // Use client-side timestamp for immediate use
          updatedAt: transactionData.transactionDate,
      }

      setNewTransaction(finalTransaction);
      
      toast({
        title: "Record Saved",
        description: `${certificateType} for ${selectedResident.displayName} is recorded.`,
      });
      
      setIsPrintModalOpen(true);

    } catch (error) {
      console.error("Error saving transaction: ", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save the transaction. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const resetForm = () => {
    setSelectedResident(null);
    setCertificateType('');
    setPurpose('');
    setFees('0.00');
    setNewTransaction(null);
  }
  
  const handleClosePrintModal = () => {
    setIsPrintModalOpen(false);
    resetForm();
  }


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Issue Certificate</h1>
          <p className="text-slate-400">Select a resident and fill out the form to generate a document.</p>
        </div>
         <Link href="/" passHref>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Hub
          </Button>
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Step 1: Resident Selection */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User /> Step 1: Select a Resident</CardTitle>
          </CardHeader>
          <CardContent>
            <ResidentPicker
              onSelectResident={(res) => setSelectedResident(res as Resident | null)}
              selectedResident={selectedResident}
            />
             {selectedResident && (
                <div className="mt-4 p-4 bg-slate-900 rounded-lg">
                    <p className="font-bold text-lg">{selectedResident.displayName}</p>
                    <p className="text-sm text-slate-400">RBI ID: {selectedResident.rbiId}</p>
                    <p className="text-sm text-slate-400">Address: {selectedResident.addressSnapshot.addressLine}</p>
                </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Transaction Details */}
        <Card className={`bg-slate-800/50 border-slate-700 transition-opacity ${!selectedResident ? 'opacity-50 pointer-events-none' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText /> Step 2: Certificate Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="cert-type" className="text-lg">Certificate Type</Label>
              <Select onValueChange={(value: CertificateType) => setCertificateType(value)} value={certificateType}>
                <SelectTrigger id="cert-type" className="h-12 text-lg bg-slate-900 border-slate-600 mt-1">
                  <SelectValue placeholder="Select document type..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 text-white border-slate-700">
                  <SelectItem value="Barangay Clearance">Barangay Clearance</SelectItem>
                  <SelectItem value="Certificate of Indigency">Certificate of Indigency</SelectItem>
                  <SelectItem value="Certificate of Residency">Certificate of Residency</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div>
              <Label htmlFor="purpose" className="text-lg">Purpose</Label>
              <Input id="purpose" placeholder="e.g., For Local Employment, Hospital Admission" className="h-12 text-lg bg-slate-900 border-slate-600 mt-1" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
            </div>
             <div>
              <Label htmlFor="fees" className="text-lg">Fees Collected (₱)</Label>
              <Input id="fees" type="number" placeholder="0.00" className="h-12 text-lg bg-slate-900 border-slate-600 mt-1" value={fees} onChange={(e) => setFees(e.target.value)} />
            </div>
          </CardContent>
        </Card>
      </div>

       {/* Step 3: Save & Preview */}
       <div className="flex justify-end">
            <Button 
                className="bg-blue-600 hover:bg-blue-700 h-14 text-xl px-8" 
                onClick={handleSaveAndPreview}
                disabled={!selectedResident || !certificateType || !purpose || isSaving}
            >
                <Save className="mr-2 h-6 w-6" />
                {isSaving ? "Saving..." : "Save & Preview"}
            </Button>
       </div>
       
       {isPrintModalOpen && newTransaction && selectedResident && (
         <PrintCertificateModal
            isOpen={isPrintModalOpen}
            onClose={handleClosePrintModal}
            transaction={newTransaction}
            resident={selectedResident}
         />
       )}
    </div>
  );
};

export default CertificatesPage;
