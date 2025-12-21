
"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { getManilaDate, getManilaYesterday } from '@/lib/date';


interface SmartDateInputProps {
  value: string; // Expects "YYYY-MM-DD"
  onChange: (newDate: string) => void;
  labelText?: string;
  helperText?: string;
  className?: string;
}

const QuickActionButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => (
  <button
    type="button"
    className={cn(
      "rounded-full bg-muted px-3 py-1 text-xs font-bold uppercase text-primary transition-colors hover:bg-accent",
      className
    )}
    {...props}
  >
    {children}
  </button>
);

export const SmartDateInput: React.FC<SmartDateInputProps> = ({ value, onChange, labelText, helperText, className }) => {

  const handleQuickAction = (action: 'today' | 'yesterday') => {
    if (action === 'today') {
      onChange(getManilaDate());
    } else {
      onChange(getManilaYesterday());
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {labelText && (
        <label className="mb-1 block text-sm font-medium">
          {labelText}
        </label>
      )}
       {helperText && (
        <p className="mb-2 text-xs text-muted-foreground">{helperText}</p>
      )}
      <div className="mb-2 flex items-center gap-2">
        <QuickActionButton onClick={() => handleQuickAction('today')}>
          Today
        </QuickActionButton>
        <QuickActionButton onClick={() => handleQuickAction('yesterday')}>
          Yesterday
        </QuickActionButton>
      </div>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border bg-background p-3 text-lg focus:ring-2 focus:ring-ring"
        style={{
          colorScheme: 'light', 
        }}
      />
    </div>
  );
};
