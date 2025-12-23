import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { lolaHeights, lolaRadii, lolaShadows, lolaSpacing } from '@/styles/tokens';

type LolaSectionProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export function LolaSection({ title, subtitle, children, className }: LolaSectionProps) {
  return (
    <section className={cn('space-y-3', className)}>
      {(title || subtitle) && (
        <header className="space-y-1">
          {title && <h2 className="text-xl font-semibold text-slate-900">{title}</h2>}
          {subtitle && <p className="text-base text-slate-600">{subtitle}</p>}
        </header>
      )}
      {children}
    </section>
  );
}

type LolaCardProps = {
  children: ReactNode;
  className?: string;
};

export function LolaCard({ children, className }: LolaCardProps) {
  return (
    <div
      className={cn(
        'bg-white border border-slate-200 text-slate-900 shadow-sm',
        'rounded-2xl',
        className,
      )}
      style={{ boxShadow: lolaShadows.card, padding: lolaSpacing.lg }}
    >
      {children}
    </div>
  );
}

type LolaRowLinkProps = {
  title: string;
  description?: string;
  meta?: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  icon?: ReactNode;
};

export function LolaRowLink({ title, description, meta, href, onClick, disabled, icon }: LolaRowLinkProps) {
  const Content = (
    <div
      className={cn(
        'flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4',
        'transition-colors',
        disabled ? 'cursor-not-allowed opacity-70' : 'hover:bg-slate-50',
      )}
      style={{ minHeight: lolaHeights.row, borderRadius: lolaRadii.lg }}
    >
      <div className="flex items-center gap-3">
        {icon && <div className="text-blue-700">{icon}</div>}
        <div>
          <p className="text-lg font-semibold text-slate-900">{title}</p>
          {description && <p className="text-sm text-slate-600">{description}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {meta && <span className="text-sm font-semibold text-blue-700">{meta}</span>}
        <ChevronRight className="h-6 w-6 text-slate-400" />
      </div>
    </div>
  );

  if (href && !disabled) {
    return <Link href={href} className="block">{Content}</Link>;
  }

  return (
    <button type="button" onClick={onClick} className="block w-full text-left" disabled={disabled}>
      {Content}
    </button>
  );
}
