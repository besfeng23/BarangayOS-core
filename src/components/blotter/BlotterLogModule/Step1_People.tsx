
"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const Step1People = ({ formData, setFormData }: { formData: any, setFormData: any }) => {
  const [isRespondentUnknown, setIsRespondentUnknown] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    setIsRespondentUnknown(checked);
    if(checked) {
      const { respondent, ...rest } = formData;
      setFormData({ ...rest, respondent: 'Unknown' });
    } else {
      const { respondent, ...rest } = formData;
      setFormData(rest);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Complainant Side */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-blue-400">Complainant</h3>
        <div>
          <Label htmlFor="complainant" className="text-lg">Full Name</Label>
          <Input id="complainant" placeholder="e.g., Juan Dela Cruz" className="h-12 text-lg bg-slate-900 border-slate-600 mt-1" value={formData.complainant || ''} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="complainant-contact" className="text-lg">Contact #</Label>
          <Input id="complainant-contact" placeholder="e.g., 09123456789" className="h-12 text-lg bg-slate-900 border-slate-600 mt-1" />
        </div>
      </div>

      {/* Respondent Side */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-orange-400">Respondent</h3>
        <div className="flex items-center space-x-2">
          <Checkbox id="respondent-unknown" onCheckedChange={(checked) => handleCheckboxChange(Boolean(checked))} />
          <Label htmlFor="respondent-unknown" className="text-lg">Respondent is Unknown</Label>
        </div>

        {!isRespondentUnknown && (
          <div>
            <Label htmlFor="respondent" className="text-lg">Full Name</Label>
            <Input id="respondent" placeholder="e.g., Maria Santos" className="h-12 text-lg bg-slate-900 border-slate-600 mt-1" value={formData.respondent || ''} onChange={handleChange} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Step1People;
