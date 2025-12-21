
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
import { help } from '@/ai/flows/help';
import { Loader2, Sparkles, User, Bot } from 'lucide-react';
import { useToast } from '../ui/toast';
import { usePathname } from 'next/navigation';
import { getRecentErrors } from '@/lib/bos/errors/errorBus';

interface HelpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpDrawer({ isOpen, onClose }: HelpDrawerProps) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const { toast } = useToast();
  const pathname = usePathname();

  const handleAsk = async () => {
    if (!query) {
      toast({ variant: 'destructive', title: 'Question needed', description: 'Please enter your question.' });
      return;
    }
    setIsAsking(true);
    setResponse('');
    try {
      const recentErrors = getRecentErrors();
      const errorContext = recentErrors.length > 0 ? `Recent error: ${recentErrors[0].message}` : undefined;
      
      const result = await help({ query, context: pathname, errorContext });

      if (result?.response) {
        setResponse(result.response);
      } else {
        throw new Error('The AI did not return a valid response.');
      }
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'AI Assistant Failed',
        description: error.message || 'The AI assistant could not complete the request.',
      });
      setResponse("I'm sorry, I encountered an error and couldn't process your request. Please check the system status or try again later.");
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md w-full flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-amber-400" />
            Ask BarangAI
          </SheetTitle>
          <SheetDescription>
            Your AI assistant for BarangayOS. Ask me anything about the app.
          </SheetDescription>
        </SheetHeader>
        <div className="py-6 flex-grow flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="question" className="text-lg font-semibold">
              Your Question
            </Label>
            <Textarea
              id="question"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., How do I print a blotter report?"
              className="mt-2 text-base bg-zinc-950 border-zinc-700 min-h-[100px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAsk();
                }
              }}
            />
          </div>
          <Button onClick={handleAsk} disabled={isAsking || !query} className="w-full h-12 text-lg">
            {isAsking ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {isAsking ? 'Thinking...' : 'Ask'}
          </Button>

          {(isAsking || response) && (
             <div className="mt-4 p-4 bg-zinc-800/50 rounded-lg space-y-4 flex-grow">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-5 w-5 text-blue-300" />
                    </div>
                    {isAsking ? (
                         <div className="pt-1">
                            <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                         </div>
                    ): (
                        <p className="text-zinc-200 whitespace-pre-wrap">{response}</p>
                    )}
                </div>
            </div>
          )}
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={onClose} disabled={isAsking} className="w-full">
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
