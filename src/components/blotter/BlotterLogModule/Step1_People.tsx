
"use client";

import React, { useState } from 'react';
import { ResidentPicker } from '@/components/residents/ResidentPicker';
import type { Resident } from '@/lib/firebase/schema';

const Step1People = ({ formData, setFormData }: { formData: any, setFormData: any }) => {
  const handleSelectComplainant = (resident: Resident | null) => {
    setFormData({ ...formData, complainant: resident });
  };

  const handleSelectRespondent = (resident: Resident | null) => {
    setFormData({ ...formData, respondent: resident });
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Complainant Side */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-blue-400">Complainant (Nagrereklamo)</h3>
        <ResidentPicker
          onSelectResident={handleSelectComplainant}
          selectedResident={formData.complainant}
        />
      </div>

      {/* Respondent Side */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-orange-400">Respondent (Inirereklamo)</h3>
        <ResidentPicker
          onSelectResident={handleSelectRespondent}
          selectedResident={formData.respondent}
          isRespondent
        />
      </div>
    </div>
  );
};

export default Step1People;
