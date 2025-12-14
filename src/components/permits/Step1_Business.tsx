
"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Step1Business = ({ formData, setFormData }: { formData: any, setFormData: any }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    if (id === 'ownerName' || id === 'contactNumber') {
      setFormData({ 
          ...formData, 
          owner: { ...formData.owner, [id === 'ownerName' ? 'fullName' : 'contactNo']: value }
      });
    } else if (id === 'businessAddress') {
      setFormData({
          ...formData,
          businessAddress: { ...formData.businessAddress, purok: value } // Assuming purok for now
      })
    }
    else {
      setFormData({ ...formData, [id]: value });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
          <Label htmlFor="businessName" className="text-lg">Business Name</Label>
          <Input id="businessName" placeholder="e.g., Aling Nena's Sari-Sari Store" className="h-12 text-lg bg-slate-900 border-slate-600 mt-1" onChange={handleChange} value={formData.businessName || ''}/>
        </div>
        <div>
          <Label htmlFor="businessAddress" className="text-lg">Purok</Label>
          <Input id="businessAddress" placeholder="e.g., Purok 3" className="h-12 text-lg bg-slate-900 border-slate-600 mt-1" onChange={handleChange} value={formData.businessAddress?.purok || ''}/>
        </div>
      </div>
      <div className="space-y-6">
        <div>
          <Label htmlFor="ownerName" className="text-lg">Owner's Full Name</Label>
          <Input id="ownerName" placeholder="e.g., Juan Dela Cruz" className="h-12 text-lg bg-slate-900 border-slate-600 mt-1" onChange={handleChange} value={formData.owner?.fullName || ''}/>
        </div>
        <div>
          <Label htmlFor="contactNumber" className="text-lg">Contact Number</Label>
          <Input id="contactNumber" placeholder="e.g., 09171234567" className="h-12 text-lg bg-slate-900 border-slate-600 mt-1" onChange={handleChange} value={formData.owner?.contactNo || ''}/>
        </div>
      </div>
    </div>
  );
};

export default Step1Business;
