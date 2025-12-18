
"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { useToast } from "@/components/ui/Toast";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResidentPicker } from '@/components/residents/ResidentPicker';
import type { Resident } from '@/lib/firebase/schema';
import PrintPermitModal from './PrintPermitModal';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { businessPermitConverter, type BusinessPermit } from '@/lib/firebase/schema';

interface NewPermitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewPermitModal = ({ isOpen, onClose }: NewPermitModalProps) => {
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [address, setAddress] = useState('');
  const [fees, setFees] = useState('500.00');

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [newPermit, setNewPermit] = useState<BusinessPermit | null>(null);
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectResident = (resident: Resident | null) => {
    setSelectedResident(resident);
    if (resident) {
        setAddress(resident.addressSnapshot.addressLine);
    }
  }

  const resetForm = () => {
      setSelectedResident(null);
      setBusinessName('');
      setBusinessType('');
      setAddress('');
      setFees('500.00');
      setNewPermit(null);
  }

  const handleSave = async () => {
    if (!selectedResident || !businessName || !businessType) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please select a resident owner and provide business name and type.",
        });
        return;
    }
    
    if (!window.confirm("Are you sure you want to issue this permit?")) {
        return;
    }
      
    setIsSaving(true);
    toast({
        title: "Saving Permit...",
        description: "Logging new business registration.",
    });

    try {
        const issuedAt = new Date();

        const newPermitData: Omit<BusinessPermit, 'id' | 'createdAt' | 'updatedAt' | 'issuedAt'> = {
            permitNo: `BOS-BP-${Date.now()}`,
            status: 'Active',
            businessName: businessName,
            businessAddress: {
                purok: selectedResident.addressSnapshot.purok,
                street: address,
                barangay: 'Dau',
                city: 'Mabalacat',
                province: 'Pampanga'
            },
            owner: {
                fullName: selectedResident.displayName,
                contactNo: selectedResident.contact?.mobile || '',
                address: selectedResident.addressSnapshot.addressLine,
                residentId: selectedResident.id,
            },
            feesCollected: parseFloat(fees),
            barangayId: "TEST-BARANGAY-1",
            issuedBy: "SECRETARY-DEVICE-1", // Mock User
            category: businessType,
            applicationType: 'NEW',
            payment: { status: 'PAID' },
            totals: { total: parseFloat(fees), subtotal: parseFloat(fees), penalties: 0, discounts: 0},
            requirements: [],
            flags: []
        };

        const permitsRef = collection(db, 'business_permits').withConverter(businessPermitConverter);
        const docRef = await addDoc(permitsRef, {
            ...newPermitData,
            issuedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        
        const finalPermitRecord: BusinessPermit = {
            ...newPermitData,
            id: docRef.id,
            issuedAt: issuedAt, // Use client timestamp for immediate use
            createdAt: new Date(),
            updatedAt: new Date()
        } as unknown as BusinessPermit;

        setNewPermit(finalPermitRecord);
        
        toast({
            title: "Registration Saved",
            description: `Permit for ${businessName} has been logged.`,
        });

        setIsPrintModalOpen(true);
    
    } catch (error) {
        console.error("Error saving permit:", error);
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "Could not save the new registration. Please try again.",
        });
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleClosePrintModal = () => {
    setIsPrintModalOpen(false);
    resetForm();
    onClose();
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle className="text-2xl">Log New Business Permit</DialogTitle>
             <DialogDescription>
                Enter the details for the new business registration. This will create an active permit immediately.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2 space-y-2">
                <Label className="text-lg">1. Select Owner</Label>
                <ResidentPicker onSelectResident={handleSelectResident} selectedResident={selectedResident} />
            </div>

            <div className={`col-span-2 space-y-6 transition-opacity ${!selectedResident ? 'opacity-50 pointer-events-none' : ''}`}>
                 <div className="space-y-2">
                    <Label htmlFor="businessName" className="text-lg">2. Business Name</Label>
                    <Input id="businessName" placeholder="e.g., Aling Nena's Sari-Sari Store" className="h-12 text-lg bg-slate-900 border-slate-600" onChange={(e) => setBusinessName(e.target.value)} value={businessName}/>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="businessType" className="text-lg">3. Business Type</Label>
                        <Select onValueChange={setBusinessType} value={businessType}>
                            <SelectTrigger className="h-12 text-lg bg-slate-900 border-slate-600">
                                <SelectValue placeholder="Select type..." />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 text-white border-slate-700">
                                <SelectItem value="Sari-Sari Store">Sari-Sari Store</SelectItem>
                                <SelectItem value="Eatery">Eatery</SelectItem>
                                <SelectItem value="Service">Service</SelectItem>
                                <SelectItem value="Vendor">Vendor</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="fees" className="text-lg">5. Fees Collected (₱)</Label>
                        <Input id="fees" type="number" placeholder="0.00" className="h-12 text-lg bg-slate-900 border-slate-600" value={fees} onChange={(e) => setFees(e.target.value)} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="address" className="text-lg">4. Business Address</Label>
                    <Input id="address" placeholder="e.g., 123 Rizal St." className="h-12 text-lg bg-slate-900 border-slate-600" onChange={(e) => setAddress(e.target.value)} value={address}/>
                </div>
            </div>
          </div>


          <DialogFooter>
             <Button variant="outline" className="h-12 text-lg" onClick={onClose} disabled={isSaving}>
                Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 h-12 text-lg" onClick={handleSave} disabled={isSaving || !selectedResident}>
                <Save className="mr-2 h-5 w-5" />
                {isSaving ? 'Saving...' : 'Review & Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {newPermit && selectedResident && (
        <PrintPermitModal 
            isOpen={isPrintModalOpen}
            onClose={handleClosePrintModal}
            permit={newPermit}
            resident={selectedResident}
        />
      )}
    </>
  );
};

export default NewPermitModal;
