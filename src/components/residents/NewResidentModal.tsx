
"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { residentConverter, type Resident } from '@/lib/firebase/schema';
import { Camera } from 'lucide-react';

interface NewResidentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewResidentModal = ({ isOpen, onClose }: NewResidentModalProps) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!firstName || !lastName) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter a first and last name.",
      });
      return;
    }

    setIsSaving(true);
    toast({
      title: "Saving...",
      description: "Adding new resident to the database.",
    });

    try {
      const residentsRef = collection(db, 'residents').withConverter(residentConverter);
      
      const newResident: Omit<Resident, 'id' | 'createdAt' | 'updatedAt'> = {
        barangayId: "TEST-BARANGAY-1",
        rbiId: `BRGY-${Date.now()}`, // Temporary ID
        fullName: {
          first: firstName,
          last: lastName,
        },
        displayName: `${lastName.toUpperCase()}, ${firstName}`,
        displayNameLower: `${lastName.toLowerCase()}, ${firstName.toLowerCase()}`,
        sex: 'M', // Default value
        addressSnapshot: {
          purok: 'Purok 1', // Default value
          addressLine: 'TBD', // Default value
        },
        status: 'active',
        consent: { signed: false },
        createdBy: "SECRETARY-DEVICE-1",
        updatedBy: "SECRETARY-DEVICE-1",
      };
      
      // The logic for image capture and compression would go here.
      // The captured image would first be resized to a max-width of 1024px.
      // Then, it would be compressed to 70% quality before being uploaded to Firebase Storage.
      // This ensures bandwidth usage is minimized on metered connections.
      // Optimized for Smart Enterprise Metered Plans.

      await addDoc(residentsRef, newResident);
      
      toast({
        title: "Resident Saved!",
        description: `${firstName} ${lastName} has been added.`,
      });

      // Reset form and close
      setFirstName('');
      setLastName('');
      onClose();

    } catch (error) {
      console.error("Error adding resident: ", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Could not save resident. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl">New Resident Record</DialogTitle>
          <DialogDescription>
            Enter the basic details for the new resident. More information can be added later.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="first-name" className="text-lg">First Name</Label>
                <Input 
                    id="first-name" 
                    placeholder="e.g., Juan" 
                    className="h-12 text-lg bg-slate-900 border-slate-600" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="last-name" className="text-lg">Last Name</Label>
                <Input 
                    id="last-name" 
                    placeholder="e.g., Dela Cruz" 
                    className="h-12 text-lg bg-slate-900 border-slate-600" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                />
            </div>
             <div className="col-span-1 md:col-span-2">
                <Label className="text-lg">Photo</Label>
                <Button variant="outline" className="w-full h-24 mt-1 border-dashed flex-col">
                    <Camera className="h-8 w-8 text-slate-400 mb-1" />
                    <span>Take Photo</span>
                </Button>
            </div>
        </div>

        <DialogFooter>
          <Button variant="outline" className="h-12 text-lg" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 h-12 text-lg" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Record'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewResidentModal;
