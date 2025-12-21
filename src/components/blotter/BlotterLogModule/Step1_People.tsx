
"use client";

import React from 'react';
import { ResidentPicker, ResidentPickerValue } from '@/components/shared/ResidentPicker';
import type { Resident } from '@/lib/firebase/schema';

const Step1People = ({ formData, setFormData }: { formData: any, setFormData: any }) => {
  const handleSelectComplainant = (resident: ResidentPickerValue) => {
    setFormData({ ...formData, complainant: resident });
  };

  const handleSelectRespondent = (resident: ResidentPickerValue) => {
    setFormData({ ...formData, respondent: resident });
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Complainant Side */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-blue-400">Complainant</h3>
        <ResidentPicker
          label="Complainant"
          allowManual={true}
          value={formData.complainant}
          onChange={handleSelectComplainant}
        />
      </div>

      {/* Respondent Side */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-orange-400">Respondent</h3>
        <ResidentPicker
          label="Respondent"
          allowManual={true}
          value={formData.respondent}
          onChange={handleSelectRespondent}
        />
      </div>
    </div>
  );
};

export default Step1People;
