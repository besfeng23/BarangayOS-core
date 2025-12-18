"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ActionResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: {
    ok: boolean;
    message: string;
    statusLine: string;
  };
  onRetry?: () => void;
  retryText?: string;
  primaryActionText?: string;
  onPrimaryAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}

export default function ActionResultModal({
  isOpen,
  onClose,
  result,
  onRetry,
  retryText = "Retry",
  primaryActionText = "Done",
  onPrimaryAction,
  secondaryActionText,
  onSecondaryAction,
}: ActionResultModalProps) {

  const handlePrimary = () => {
    if (onPrimaryAction) {
      onPrimaryAction();
    } else {
      onClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-700 text-white sm:max-w-md">
        <DialogHeader className="text-center items-center">
          {result.ok ? (
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
          ) : (
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
          )}
          <DialogTitle className="text-2xl">{result.ok ? 'Success' : 'Error'}</DialogTitle>
          <DialogDescription className="text-lg text-zinc-400">{result.message}</DialogDescription>
        </DialogHeader>
        <div className="text-center bg-zinc-800/50 p-3 rounded-lg">
            <p className="text-sm text-zinc-300">{result.statusLine}</p>
        </div>
        <DialogFooter className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
          {!result.ok && onRetry && (
            <Button onClick={onRetry} className="h-12 text-lg">{retryText}</Button>
          )}
          {secondaryActionText && (
             <Button variant="outline" onClick={onSecondaryAction} className="h-12 text-lg">{secondaryActionText}</Button>
          )}
          <Button onClick={handlePrimary} variant={result.ok ? 'default' : 'outline'} className="h-12 text-lg col-span-full sm:col-span-1">{primaryActionText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
