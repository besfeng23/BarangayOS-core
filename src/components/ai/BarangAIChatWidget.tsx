'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bot, User, Send, X, Loader2, Sparkles } from 'lucide-react';
import { chat } from '@/ai/flows/chat';
import { useToast } from '../ui/toast';
import { redactPII } from '@/lib/ai/redact';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  isError?: boolean;
}

const QUICK_PROMPTS = [
  "How does offline-first work?",
  "What can BOS print?",
  "What are the requirements to start?",
  "How do we deploy this?"
];

const ChatBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === 'user';
  return (
    <div className={cn("flex items-start gap-2.5", isUser ? 'justify-end' : '')}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
          <Bot className="h-5 w-5 text-blue-300" />
        </div>
      )}
      <div
        className={cn(
          "px-3.5 py-2.5 rounded-2xl max-w-[80%] text-sm md:text-base",
          isUser
            ? 'bg-blue-600 text-white rounded-br-lg'
            : message.isError ? 'bg-red-500/20 text-red-200 rounded-bl-lg' : 'bg-zinc-700 text-zinc-200 rounded-bl-lg'
        )}
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

export default function BarangAIChatWidget({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (isOpen: boolean) => void }) {
  const [history, setHistory] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: 'Hello! I am BarangAI. How can I help you learn about BarangayOS today?',
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
  }, [history, isThinking]);

  const handleSubmit = useCallback(async (promptText: string) => {
    if (!promptText.trim()) return;

    const redactedQuery = redactPII(promptText);
    if(redactedQuery !== promptText) {
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
      const errorMessage = "I'm sorry, I encountered a connection error and couldn't process your request. Please try again in a moment.";
      setHistory([...newHistory, { role: 'model', content: errorMessage, isError: true }]);
    } finally {
      setIsThinking(false);
    }
  }, [history, toast]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(query);
  }

  return (
    <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-24 right-4 z-[99] w-[min(92vw,380px)] h-[min(70vh,600px)] bg-zinc-800/80 backdrop-blur-xl border border-zinc-700 rounded-2xl shadow-2xl flex flex-col"
        aria-modal="true"
        role="dialog"
      >
        <header className="p-4 border-b border-zinc-700 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-6 w-6 text-blue-300" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-zinc-100">BarangAI</h2>
              <p className="text-xs text-zinc-400">Your guide to BarangayOS.</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} aria-label="Close chat">
            <X className="h-5 w-5" />
          </Button>
        </header>
        
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-6">
          {history.map((msg, index) => (
            <ChatBubble key={index} message={msg} />
          ))}
           {isThinking && (
               <div className="flex items-start gap-2.5">
                   <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                       <Bot className="h-5 w-5 text-blue-300" />
                   </div>
                   <div className="px-3.5 py-2.5 rounded-2xl bg-zinc-700">
                      <Loader2 className="h-5 w-5 animate-spin" />
                   </div>
               </div>
          )}
        </div>
        
        <footer className="p-3 border-t border-zinc-700">
           <div className="px-1 mb-2 flex flex-wrap gap-1.5">
             {QUICK_PROMPTS.map(p => (
                <Badge 
                  key={p} 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-zinc-600"
                  onClick={() => handleSubmit(p)}
                >
                  {p}
                </Badge>
             ))}
           </div>
          <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question..."
              className="bg-zinc-700 border-zinc-600 rounded-lg text-sm max-h-24 py-2.5"
              rows={1}
              onKeyDown={(e) => {
                  if(e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleFormSubmit(e);
                  }
              }}
            />
            <Button type="submit" size="icon" className="h-10 w-10 flex-shrink-0" disabled={isThinking || !query.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
           <p className="text-xs text-zinc-500 mt-2 px-2">Don&apos;t enter personal info.</p>
        </footer>
      </motion.div>
    )}
    </AnimatePresence>
  );
}
