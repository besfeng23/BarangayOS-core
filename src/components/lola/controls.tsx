import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { lolaHeights, lolaRadii, lolaShadows, lolaSpacing } from '@/styles/tokens';

type LolaButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
};

export const LolaPrimaryButton = forwardRef<HTMLButtonElement, LolaButtonProps>(
  ({ className, children, fullWidth = true, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'bg-blue-700 text-white font-semibold text-lg shadow-sm transition-colors',
        'hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200',
        'disabled:opacity-70 disabled:cursor-not-allowed',
        fullWidth ? 'w-full' : 'w-auto',
        className,
      )}
      style={{ height: lolaHeights.primaryButton, borderRadius: lolaRadii.lg, padding: `0 ${lolaSpacing.lg}px` }}
      {...props}
    >
      {children}
    </button>
  ),
);
LolaPrimaryButton.displayName = 'LolaPrimaryButton';

export const LolaSecondaryButton = forwardRef<HTMLButtonElement, LolaButtonProps>(
  ({ className, children, fullWidth = true, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'border-2 border-slate-200 bg-white text-slate-900 font-semibold text-lg shadow-sm transition-colors',
        'hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100',
        'disabled:opacity-70 disabled:cursor-not-allowed',
        fullWidth ? 'w-full' : 'w-auto',
        className,
      )}
      style={{ height: lolaHeights.secondaryButton, borderRadius: lolaRadii.lg, padding: `0 ${lolaSpacing.lg}px` }}
      {...props}
    >
      {children}
    </button>
  ),
);
LolaSecondaryButton.displayName = 'LolaSecondaryButton';

type LolaInputProps = React.InputHTMLAttributes<HTMLInputElement>;
type LolaTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;
type LolaSelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const LolaInput = forwardRef<HTMLInputElement, LolaInputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'w-full border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400',
      'text-base font-medium focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100',
      className,
    )}
    style={{ height: lolaHeights.control, borderRadius: lolaRadii.lg, padding: `0 ${lolaSpacing.lg}px`, boxShadow: lolaShadows.card }}
    {...props}
  />
));
LolaInput.displayName = 'LolaInput';

export const LolaSelect = forwardRef<HTMLSelectElement, LolaSelectProps>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'w-full border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-500',
      'text-base font-medium focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100',
      className,
    )}
    style={{ height: lolaHeights.control, borderRadius: lolaRadii.lg, padding: `0 ${lolaSpacing.lg}px`, boxShadow: lolaShadows.card }}
    {...props}
  >
    {children}
  </select>
));
LolaSelect.displayName = 'LolaSelect';

export const LolaTextarea = forwardRef<HTMLTextAreaElement, LolaTextareaProps>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'w-full border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400',
      'text-base font-medium focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100',
      className,
    )}
    style={{
      minHeight: 140,
      borderRadius: lolaRadii.lg,
      padding: `${lolaSpacing.md}px ${lolaSpacing.lg}px`,
      boxShadow: lolaShadows.card,
      lineHeight: 1.5,
    }}
    {...props}
  />
));
LolaTextarea.displayName = 'LolaTextarea';
