import { CheckCircle2, Info, PlugZap, TriangleAlert } from 'lucide-react';
import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { lolaRadii, lolaSpacing } from '@/styles/tokens';

type LolaBannerVariant = 'success' | 'error' | 'info' | 'offline';

const bannerStyles: Record<LolaBannerVariant, { bg: string; text: string; icon: ReactNode }> = {
  success: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', icon: <CheckCircle2 className="h-6 w-6 text-emerald-600" /> },
  error: { bg: 'bg-red-50 border-red-200', text: 'text-red-800', icon: <TriangleAlert className="h-6 w-6 text-red-600" /> },
  info: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', icon: <Info className="h-6 w-6 text-blue-600" /> },
  offline: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', icon: <PlugZap className="h-6 w-6 text-amber-600" /> },
};

type LolaBannerProps = {
  title: string;
  message: string;
  variant?: LolaBannerVariant;
  compact?: boolean;
  className?: string;
};

export function LolaBanner({ title, message, variant = 'info', compact, className }: LolaBannerProps) {
  const style = bannerStyles[variant];
  return (
    <div
      className={cn(
        'flex w-full items-start gap-3 rounded-2xl border px-4 text-left',
        style.bg,
        style.text,
        compact ? 'py-3' : 'py-4',
        className,
      )}
      style={{ borderRadius: lolaRadii.lg }}
    >
      <div className="mt-0.5">{style.icon}</div>
      <div className="space-y-1">
        <p className="font-semibold text-lg leading-tight">{title}</p>
        <p className="text-base leading-snug">{message}</p>
      </div>
    </div>
  );
}

type LolaEmptyStateProps = {
  title: string;
  message: string;
  action?: ReactNode;
  className?: string;
};

export function LolaEmptyState({ title, message, action, className }: LolaEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center border border-dashed border-slate-300 bg-white',
        'rounded-2xl p-8 space-y-3',
        className,
      )}
      style={{ gap: lolaSpacing.md }}
    >
      <p className="text-xl font-semibold text-slate-900">{title}</p>
      <p className="text-base text-slate-600 max-w-lg">{message}</p>
      {action}
    </div>
  );
}

export function LolaSkeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-2xl bg-slate-200', className)} />;
}
