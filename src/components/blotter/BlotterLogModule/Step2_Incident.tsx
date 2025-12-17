
"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Step2Incident = ({ formData, setFormData }: { formData: any, setFormData: any }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, nature: value });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="nature" className="text-lg">Nature of Case</Label>
        <Select onValueChange={handleSelectChange} defaultValue={formData.nature}>
          <SelectTrigger className="h-12 text-lg bg-slate-950 border-slate-600 mt-1">
            <SelectValue placeholder="Select the type of incident..." />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 text-white border-slate-700">
            <SelectItem value="Theft">Theft</SelectItem>
            <SelectItem value="Gossip / Slander">Gossip / Slander</SelectItem>
            <SelectItem value="Noise Complaint">Noise Complaint</SelectItem>
            <SelectItem value="Physical Injury">Physical Injury</SelectItem>
            <SelectItem value="Property Damage">Property Damage</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label htmlFor="date" className="text-lg">Date of Incident</Label>
          <Input id="date" type="date" className="h-12 text-lg bg-slate-950 border-slate-600 mt-1" value={formData.date || ''} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="time" className="text-lg">Time of Incident</Label>
          <Input id="time" type="time" className="h-12 text-lg bg-slate-950 border-slate-600 mt-1" value={formData.time || ''} onChange={handleChange} />
        </div>
      </div>
      <div>
        <Label htmlFor="location" className="text-lg">Location of Incident</Label>
        <Input id="location" placeholder="e.g., Purok 3, near the basketball court" className="h-12 text-lg bg-slate-950 border-slate-600 mt-1" value={formData.location || ''} onChange={handleChange} />
      </div>
    </div>
  );
};

export default Step2Incident;
