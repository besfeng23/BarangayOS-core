
"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Step2Incident = ({ formData, setFormData }: { formData: any, setFormData: any }) => {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="nature" className="text-lg">Nature of Case</Label>
        <Select>
          <SelectTrigger className="h-12 text-lg bg-slate-900 border-slate-600 mt-1">
            <SelectValue placeholder="Select the type of incident..." />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 text-white border-slate-700">
            <SelectItem value="theft">Theft</SelectItem>
            <SelectItem value="gossip">Gossip / Slander</SelectItem>
            <SelectItem value="noise">Noise Complaint</SelectItem>
            <SelectItem value="injury">Physical Injury</SelectItem>
            <SelectItem value="property">Property Damage</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label htmlFor="date" className="text-lg">Date of Incident</Label>
          <Input id="date" type="date" className="h-12 text-lg bg-slate-900 border-slate-600 mt-1" />
        </div>
        <div>
          <Label htmlFor="time" className="text-lg">Time of Incident</Label>
          <Input id="time" type="time" className="h-12 text-lg bg-slate-900 border-slate-600 mt-1" />
        </div>
      </div>
      <div>
        <Label htmlFor="location" className="text-lg">Location of Incident</Label>
        <Input id="location" placeholder="e.g., Purok 3, near the basketball court" className="h-12 text-lg bg-slate-900 border-slate-600 mt-1" />
      </div>
    </div>
  );
};

export default Step2Incident;
