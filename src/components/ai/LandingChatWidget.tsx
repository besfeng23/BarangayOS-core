
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Bot, User, Send, X, Loader2, Sparkles, MessageCircle } from 'lucide-react';
import { chat } from '@/ai/flows/chat';
import { useToast } from '../ui/toast';
import { redactPII } from '@/lib/ai/redact';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

const ChatBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === 'user';
  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
          <Bot className="h-5 w-5 text-blue-300" />
        </div>
      )}
      <div
        className={`px-4 py-2 rounded-2xl max-w-sm ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-zinc-700 text-zinc-200 rounded-bl-none'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
       {isUser && (
        <div className="w-8 h-8 rounded-full bg-zinc-600 flex items-center justify-center flex-shrink-0">
          <User className="h-5 w-5 text-zinc-200" />
        </div>
      )}
    </div>
  );
};

export default function LandingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: 'Hello! I am the BOS Assistant. How can I help you learn about BarangayOS today?',
    },
  ]);
  const [query, setQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const { toast } = useToast();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const redactedQuery = redactPII(query);
    if(redactedQuery !== query) {
        toast({
            variant: 'destructive',
            title: 'PII Detected',
            description: 'For your privacy, personal information has been redacted.',
        });
    }

    const newUserMessage: ChatMessage = { role: 'user', content: redactedQuery };
    const newHistory = [...history, newUserMessage];
    setHistory(newHistory);
    setQuery('');
    setIsThinking(true);

    try {
      const result = await chat({ query: redactedQuery, history });
      if (result?.response) {
        setHistory([...newHistory, { role: 'model', content: result.response }]);
      } else {
        throw new Error('The assistant did not return a valid response.');
      }
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Assistant Error',
        description: 'Sorry, I was unable to process that request.',
      });
       setHistory([...newHistory, { role: 'model', content: "I'm sorry, I encountered an error and couldn't process your request." }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[100]">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-16 h-16 bg-blue-600 hover:bg-blue-700 shadow-lg text-white"
        >
          <MessageCircle className="h-8 w-8" />
        </Button>
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md flex flex-col bg-zinc-900 text-white border-zinc-800 p-0"
        >
          <SheetHeader className="p-6 border-b border-zinc-800">
            <SheetTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="h-6 w-6 text-amber-400" />
              BOS Assistant
            </SheetTitle>
            <SheetDescription>Your guide to BarangayOS.</SheetDescription>
          </SheetHeader>
          
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
            {history.map((msg, index) => (
              <ChatBubble key={index} message={msg} />
            ))}
             {isThinking && (
                 <div className="flex items-start gap-3">
                     <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                         <Bot className="h-5 w-5 text-blue-300" />
                     </div>
                     <div className="px-4 py-3 rounded-2xl bg-zinc-700">
                        <Loader2 className="h-5 w-5 animate-spin" />
                     </div>
                 </div>
            )}
          </div>
          
          <div className="p-4 border-t border-zinc-800">
             <p className="text-xs text-zinc-500 mb-2 px-2">For your security, please do not enter personal information.</p>
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about features or pricing..."
                className="bg-zinc-800 border-zinc-700 rounded-lg text-base max-h-24"
                rows={1}
                onKeyDown={(e) => {
                    if(e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                    }
                }}
              />
              <Button type="submit" size="icon" className="h-12 w-12 flex-shrink-0" disabled={isThinking || !query.trim()}>
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
