
"use client";

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Mic, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Step3NarrativeProps {
  formData: any;
  setFormData: any;
  isOnline: boolean;
}

// Mock AI function
const formalizeNarrative = (text: string) => {
    return new Promise<string>((resolve) => {
        setTimeout(() => {
            const formalizedText = `On the date of the incident, the complainant alleges that the following events transpired: ${text.charAt(0).toUpperCase() + text.slice(1)}. The complainant is seeking resolution in accordance with barangay protocols.`;
            resolve(formalizedText);
        }, 1500);
    });
};

const Step3Narrative = ({ formData, setFormData, isOnline }: Step3NarrativeProps) => {
  const { toast } = useToast();
  const [isFormalizing, setIsFormalizing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  
  const handleFormalize = async () => {
    if (!formData.narrative || isFormalizing) return;
    setIsFormalizing(true);
    toast({ title: 'AI Assistant is working...', description: 'Formalizing the narrative.'});

    try {
        const formalized = await formalizeNarrative(formData.narrative);
        setFormData({ ...formData, narrative: formalized });
        toast({ title: 'Narrative Formalized!', description: 'The narrative has been updated to a formal tone.'});
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not formalize narrative.' });
    } finally {
        setIsFormalizing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="narrative" className="text-lg">Narrative of the Incident</Label>
      <Textarea
        id="narrative"
        placeholder="Start writing the story here... or use the AI to help."
        className="min-h-[250px] text-lg bg-slate-950 border-slate-600"
        value={formData.narrative || ''}
        onChange={handleChange}
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
                  disabled={!isOnline || isFormalizing}
                  onClick={handleFormalize}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  {isFormalizing ? 'Formalizing...' : 'Formalize'}
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

    