"use client";

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { useToast } from "@/components/ui/toast";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResidentPicker } from '@/components/residents/ResidentPicker';
import type { Resident } from '@/lib/firebase/schema';
import PrintPermitModal from './PrintPermitModal';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { businessPermitConverter, type BusinessPermit } from '@/lib/firebase/schema';
import { permitFormSchema } from '@/lib/validation/schemas';

interface NewPermitModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export { permitFormSchema };

const NewPermitModal = ({ isOpen, onClose }: NewPermitModalProps) => {
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [address, setAddress] = useState('');
  const [fees, setFees] = useState('500.00');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [newPermit, setNewPermit] = useState<BusinessPermit | null>(null);
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const canSave = !!selectedResident && businessName.trim().length > 1 && businessType.trim().length > 0 && address.trim().length > 2 && parseFloat(fees) > 0;
  useEffect(() => {
    const first = Object.keys(errors).find((key) => errors[key]);
    if (first) {
      const el = document.querySelector(`[data-permit-field="${first}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [errors]);

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
    const parsed = permitFormSchema.safeParse({
      resident: selectedResident ? { id: selectedResident.id, displayName: selectedResident.displayName } : null,
      businessName,
      businessType,
      address,
      fees,
    });

    if (!parsed.success) {
        const flat = parsed.error.flatten().fieldErrors;
        setErrors({
          resident: flat.resident?.[0] || '',
          businessName: flat.businessName?.[0] || '',
          businessType: flat.businessType?.[0] || '',
          address: flat.address?.[0] || '',
          fees: flat.fees?.[0] || '',
        });
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please fill in the highlighted fields.",
        });
        return;
    }
    setErrors({});
    
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
            <div className="col-span-2 space-y-2" data-permit-field="resident">
                <Label className="text-lg">1. Select Owner</Label>
                <ResidentPicker onSelectResident={handleSelectResident} selectedResident={selectedResident} />
                {errors.resident && <p className="text-sm text-red-400">{errors.resident}</p>}
            </div>

            <div className={`col-span-2 space-y-6 transition-opacity ${!selectedResident ? 'opacity-50 pointer-events-none' : ''}`}>
                 <div className="space-y-2" data-permit-field="businessName">
                    <Label htmlFor="businessName" className="text-lg">2. Business Name</Label>
                    <Input id="businessName" placeholder="e.g., Aling Nena's Sari-Sari Store" className={`h-12 text-lg bg-slate-900 border-slate-600 ${errors.businessName ? 'border-red-500' : ''}`} onChange={(e) => setBusinessName(e.target.value)} value={businessName}/>
                    {errors.businessName && <p className="text-sm text-red-400">{errors.businessName}</p>}
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2" data-permit-field="businessType">
                        <Label htmlFor="businessType" className="text-lg">3. Business Type</Label>
                        <Select onValueChange={setBusinessType} value={businessType}>
                            <SelectTrigger className={`h-12 text-lg bg-slate-900 border-slate-600 ${errors.businessType ? 'border-red-500' : ''}`}>
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
                        {errors.businessType && <p className="text-sm text-red-400">{errors.businessType}</p>}
                    </div>
                     <div className="space-y-2" data-permit-field="fees">
                        <Label htmlFor="fees" className="text-lg">5. Fees Collected (₱)</Label>
                        <Input id="fees" type="number" placeholder="0.00" className={`h-12 text-lg bg-slate-900 border-slate-600 ${errors.fees ? 'border-red-500' : ''}`} value={fees} onChange={(e) => setFees(e.target.value)} min="0" />
                        {errors.fees && <p className="text-sm text-red-400">{errors.fees}</p>}
                    </div>
                </div>
                <div className="space-y-2" data-permit-field="address">
                    <Label htmlFor="address" className="text-lg">4. Business Address</Label>
                    <Input id="address" placeholder="e.g., 123 Rizal St." className={`h-12 text-lg bg-slate-900 border-slate-600 ${errors.address ? 'border-red-500' : ''}`} onChange={(e) => setAddress(e.target.value)} value={address}/>
                    {errors.address && <p className="text-sm text-red-400">{errors.address}</p>}
                </div>
            </div>
          </div>


          <DialogFooter>
            <Button variant="outline" className="h-12 text-lg" onClick={onClose} disabled={isSaving}>
                Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 h-12 text-lg" onClick={handleSave} disabled={isSaving || !canSave}>
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
