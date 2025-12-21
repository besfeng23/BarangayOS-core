'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '../ui/toast';
import type { DraftInput, DraftOutput } from '@/ai/schemas';


interface AIDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
  onDraft: (newText: string) => void;
}

export default function AIDrawer({ isOpen, onClose, originalText, onDraft }: AIDrawerProps) {
  const [instruction, setInstruction] = useState('Make this more formal and objective for a police report.');
  const [isDrafting, setIsDrafting] = useState(false);
  const { toast } = useToast();

  const handleGenerateDraft = async () => {
    if (!instruction) {
      toast({ variant: 'destructive', title: 'Instruction needed', description: 'Please tell the AI what to do.' });
      return;
    }
    setIsDrafting(true);
    try {
      const requestBody: DraftInput = { context: originalText, instruction };

      const response = await fetch('/api/ai/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'The AI service returned an error.');
      }

      const result: DraftOutput = await response.json();
      
      if (result?.draft) {
        onDraft(result.draft);
        onClose();
      } else {
        throw new Error('The AI did not return a valid draft.');
      }
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'AI Drafting Failed',
        description: error.message || 'The AI assistant could not complete the request.',
      });
    } finally {
      setIsDrafting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="bg-zinc-900 border-zinc-800 text-white">
        <SheetHeader>
          <SheetTitle>AI Drafting Assistant</SheetTitle>
          <SheetDescription>
            Refine your text with AI. Your original text is provided as context.
          </SheetDescription>
        </SheetHeader>
        <div className="py-6 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-zinc-400 mb-2">Original Text</h4>
            <p className="text-sm bg-zinc-800 p-3 rounded-md max-h-24 overflow-y-auto">
              {originalText}
            </p>
          </div>
          <div>
            <Label htmlFor="instruction" className="text-lg font-semibold">
              Instruction
            </Label>
            <Textarea
              id="instruction"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g., Make this more formal"
              className="mt-2 text-base bg-zinc-950 border-zinc-700"
            />
          </div>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={onClose} disabled={isDrafting}>
            Cancel
          </Button>
          <Button onClick={handleGenerateDraft} disabled={isDrafting}>
            {isDrafting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isDrafting ? 'Drafting...' : 'Generate Draft'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
