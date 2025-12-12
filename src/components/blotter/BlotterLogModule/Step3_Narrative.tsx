
"use client";

import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Mic, Sparkles } from 'lucide-react';

interface Step3NarrativeProps {
  formData: any;
  setFormData: any;
  isOnline: boolean;
}

const Step3Narrative = ({ formData, setFormData, isOnline }: Step3NarrativeProps) => {
  return (
    <div className="space-y-4">
      <Label htmlFor="narrative" className="text-lg">Narrative of the Incident</Label>
      <Textarea
        id="narrative"
        placeholder="Start writing the story here..."
        className="min-h-[250px] text-lg bg-slate-900 border-slate-600"
      />
      <div className="flex justify-between items-center mt-2">
        <Button variant="secondary" className="h-12 text-lg">
          <Mic className="mr-2 h-5 w-5" />
          Dictate
        </Button>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0}>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 h-12 text-lg"
                  disabled={!isOnline}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Formalize
                </Button>
              </span>
            </TooltipTrigger>
            {!isOnline && (
              <TooltipContent>
                <p>AI Helper requires Internet.</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

      </div>
      {!isOnline && (
        <p className="text-sm text-yellow-400 text-right mt-1">
          AI Helper requires Internet.
        </p>
      )}
    </div>
  );
};

export default Step3Narrative;
