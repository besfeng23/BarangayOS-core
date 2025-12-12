
"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const Step1People = ({ formData, setFormData }: { formData: any, setFormData: any }) => {
  const [isRespondentUnknown, setIsRespondentUnknown] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Complainant Side */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-blue-400">Complainant</h3>
        <div>
          <Label htmlFor="complainant-name" className="text-lg">Full Name</Label>
          <Input id="complainant-name" placeholder="e.g., Juan Dela Cruz" className="h-12 text-lg bg-slate-900 border-slate-600 mt-1" />
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
          <Checkbox id="respondent-unknown" onCheckedChange={(checked) => setIsRespondentUnknown(!!checked)} />
          <Label htmlFor="respondent-unknown" className="text-lg">Respondent is Unknown</Label>
        </div>

        {!isRespondentUnknown && (
          <div>
            <Label htmlFor="respondent-name" className="text-lg">Full Name</Label>
            <Input id="respondent-name" placeholder="e.g., Maria Santos" className="h-12 text-lg bg-slate-900 border-slate-600 mt-1" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Step1People;
