
"use client";

import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';

const Step3Narrative = ({ formData, setFormData }: { formData: any, setFormData: any }) => {
  return (
    <div className="space-y-4">
      <Label htmlFor="narrative" className="text-lg">Narrative of the Incident</Label>
      <Textarea
        id="narrative"
        placeholder="Start writing the story here..."
        className="min-h-[250px] text-lg bg-slate-900 border-slate-600"
      />
      <div className="flex justify-end">
        <Button variant="secondary" className="h-12 text-lg">
          <Mic className="mr-2 h-5 w-5" />
          Dictate
        </Button>
      </div>
    </div>
  );
};

export default Step3Narrative;
