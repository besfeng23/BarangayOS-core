
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
      "rounded-full bg-slate-800 px-3 py-1 text-xs font-bold uppercase text-blue-400 transition-colors hover:bg-slate-700",
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
        <label className="mb-1 block text-sm font-medium text-slate-300">
          {labelText}
        </label>
      )}
       {helperText && (
        <p className="mb-2 text-xs text-slate-400">{helperText}</p>
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
        className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-lg text-white focus:ring-2 focus:ring-blue-600"
        style={{
          colorScheme: 'dark', // Inverts the calendar icon to white
        }}
      />
    </div>
  );
};
