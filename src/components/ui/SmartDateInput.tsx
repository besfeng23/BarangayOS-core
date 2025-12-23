
"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { getManilaDate, getManilaYesterday } from '@/lib/date';
import { lolaHeights, lolaRadii } from '@/styles/tokens';


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
      "h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-sm font-semibold text-blue-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
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
    <div className={cn('w-full space-y-2', className)}>
      {labelText && (
        <label className="block text-base font-semibold text-slate-800">
          {labelText}
        </label>
      )}
       {helperText && (
        <p className="text-sm text-slate-600">{helperText}</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
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
        className="w-full border-2 border-slate-200 bg-white p-3 text-base font-medium text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
        style={{
          height: lolaHeights.control,
          borderRadius: lolaRadii.lg,
          colorScheme: 'light', 
        }}
      />
    </div>
  );
};
