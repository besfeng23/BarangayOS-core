'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Bot } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { db } from '@/lib/bosDb';
import { toTokens } from '@/lib/bos/searchTokens';
import { uuid } from '@/lib/uuid';

// MOCK AI Function
async function parseWithAI(text: string) {
    return new Promise(resolve => {
        setTimeout(() => {
            const nameMatch = text.match(/([A-Za-z\s]+),?/);
            const ageMatch = text.match(/(\d+)\s*y\.?o\.?/);
            
            const name = nameMatch ? nameMatch[1].trim() : "Unknown Patient";
            const reason = text.replace(name, '').replace(ageMatch ? ageMatch[0] : '', '').trim().replace(/^,/, '').trim();
            
            const tags: string[] = [];
            if (/(fever|lagnat)/i.test(reason)) tags.push('Fever');
            if (/(cough|ubo)/i.test(reason)) tags.push('Cough');
            if (/(headache|sakit.*ulo)/i.test(reason)) tags.push('Headache');


            resolve({
                patientName: name,
                reason: reason || "General Check-up",
                tags,
            });
        }, 1500);
    });
}


export default function AIQueueModal({ isOpen, onClose }: AIQueueModalProps) {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleParseAndAdd = async () => {
    if (!text.trim()) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please enter some text to parse.'});
        return;
    };
    setIsProcessing(true);
    try {
        const result: any = await parseWithAI(text);
        
        const nowISO = new Date().toISOString();
        const newItem = {
            id: uuid(),
            createdAtISO: nowISO,
            updatedAtISO: nowISO,
            patient: { mode: 'manual', manualName: result.patientName },
            patientName: result.patientName,
            reason: result.reason,
            status: 'WAITING',
            tags: result.tags,
            searchTokens: toTokens(`${result.patientName} ${result.reason}`),
            synced: 0,
        };

        await db.clinic_queue.add(newItem as any);
        
        toast({
            title: 'Patient Added via AI',
            description: `${result.patientName} is now in the queue.`
        });
        
        setText('');
        onClose();

    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'AI Parsing Failed', description: 'Could not process the text.' });
    } finally {
        setIsProcessing(false);
    }

  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-blue-400" />
            AI Quick Add to Queue
          </DialogTitle>
          <DialogDescription>
            Paste or type a message (e.g. from SMS) to automatically add a patient to the queue.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g., 'Good morning, pa-check up po. Juan Dela Cruz, 45yo, masakit ang lalamunan at may ubo.'"
            className="min-h-[150px] text-lg bg-slate-950 border-slate-600"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>Cancel</Button>
          <Button onClick={handleParseAndAdd} disabled={isProcessing}>
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isProcessing ? 'Processing...' : 'Parse & Add to Queue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
