
'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { ensureDbOpen } from '@/lib/bos/dexie/openDb';
import IdleScreensaver from '@/components/screensaver/IdleScreensaver';
import TerminalShell from '@/components/shell/TerminalShell';

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
