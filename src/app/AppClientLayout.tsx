
'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { ensureDbOpen } from '@/lib/bos/dexie/openDb';
import IdleScreensaver from '@/components/screensaver/IdleScreensaver';
import TerminalShell from '@/components/shell/TerminalShell';
import { recordError } from '@/lib/bos/errors/errorBus';


export default function AppClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const isLandingPage = pathname.startsWith('/landing');

  useEffect(() => {
    ensureDbOpen();

    const handleError = (event: ErrorEvent) => {
      recordError('runtime-global', event.message);
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      recordError('runtime-unhandled', event.reason?.message ?? 'Unhandled promise rejection');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  if (isLoginPage || isLandingPage) {
    return <>{children}</>;
  }

  return (
    <>
      <IdleScreensaver />
      <TerminalShell>
        {children}
      </TerminalShell>
    </>
  );
}
