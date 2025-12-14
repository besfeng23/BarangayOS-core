
"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

const Step3Financials = ({ formData, setFormData }: { formData: any, setFormData: any }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
     if (id === 'totalFees') {
      setFormData({
        ...formData,
        totals: { ...formData.totals, total: value }
      });
    } else {
      setFormData({ ...formData, [id]: value });
    }
  };
  
  const handleRadioChange = (value: string) => {
    setFormData({ ...formData, paymentStatus: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
          <Label htmlFor="totalFees" className="text-lg">Total Permit Fees (₱)</Label>
          <Input 
            id="totalFees" 
            type="number" 
            placeholder="0.00" 
            className="h-12 text-lg bg-slate-900 border-slate-600 mt-1"
            onChange={handleChange}
            value={formData.totals?.total || ''}
          />
        </div>
        <div>
          <Label className="text-lg">Payment Status</Label>
          <RadioGroup 
            defaultValue={formData.paymentStatus || 'UNPAID'} 
            className="mt-2 flex gap-6"
            onValueChange={handleRadioChange}
            disabled // This is determined by system, not user
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="UNPAID" id="unpaid" />
              <Label htmlFor="unpaid" className="text-lg">Unpaid</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="PAID" id="paid" />
              <Label htmlFor="paid" className="text-lg">Paid</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
      <div>
        <Label htmlFor="notes" className="text-lg">Notes for Review (optional)</Label>
        <Textarea 
          id="notes" 
          placeholder="e.g., Pending inspection from Sanitary Office." 
          className="min-h-[150px] text-lg bg-slate-900 border-slate-600 mt-1"
          onChange={handleChange}
          value={formData.notes || ''}
        />
      </div>
    </div>
  );
};

export default Step3Financials;
