import { type CSSProperties, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { lolaPalette, lolaSpacing } from '@/styles/tokens';

type LolaPageProps = {
  children: ReactNode;
  className?: string;
};

const lolaThemeVars: CSSProperties = {
  ['--background' as string]: '0 0% 100%',
  ['--foreground' as string]: '220 25% 15%',
  ['--card' as string]: '0 0% 100%',
  ['--card-foreground' as string]: '220 25% 15%',
  ['--muted' as string]: '220 14% 96%',
  ['--muted-foreground' as string]: '215 16% 47%',
  ['--primary' as string]: '221 83% 53%',
  ['--primary-foreground' as string]: '0 0% 100%',
  ['--secondary' as string]: '217 33% 91%',
  ['--secondary-foreground' as string]: '222 47% 11%',
  ['--destructive' as string]: '0 72% 51%',
  ['--destructive-foreground' as string]: '0 0% 100%',
  ['--border' as string]: '214 32% 91%',
  ['--input' as string]: '214 32% 91%',
  ['--ring' as string]: '221 83% 53%',
  ['--radius' as string]: '14px',
};

export function LolaPage({ children, className }: LolaPageProps) {
  return (
    <div
      className={cn('min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]', className)}
      style={lolaThemeVars}
    >
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-5 lg:px-6 py-6" style={{ gap: lolaSpacing.md }}>
        {children}
      </div>
    </div>
  );
}
