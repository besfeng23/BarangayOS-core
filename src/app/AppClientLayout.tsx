'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ensureDbOpen } from '@/lib/bos/dexie/openDb';
import IdleScreensaver from '@/components/screensaver/IdleScreensaver';
import TerminalShell from '@/components/shell/TerminalShell';
import { recordError } from '@/lib/bos/errors/errorBus';
import { Button } from '@/components/ui/button';
import { resetLocalDatabase } from '@/lib/bosDb';
import { HelpCircle } from 'lucide-react';
import HelpDrawer from '@/components/ai/HelpDrawer';

const ErrorPanel = ({ error, onReset }: { error: Error, onReset: () => void }) => (
  <div className="flex items-center justify-center min-h-screen bg-zinc-950">
    <div className="max-w-2xl mx-auto p-8 bg-zinc-900 border border-red-800 rounded-2xl text-center">
      <h1 className="text-2xl font-bold text-red-400">Application Startup Error</h1>
      <p className="text-zinc-300 mt-2">
        A critical error occurred while initializing the local database. This can happen after an application upgrade.
      </p>
      <p className="mt-4 p-3 bg-zinc-800 rounded-lg font-mono text-xs text-red-300 text-left">
        {error.message}
      </p>
      <p className="text-zinc-400 mt-4 text-sm">
        You can try to resolve this by resetting your local data. This will not delete any data that has already been synced to the cloud.
      </p>
      <Button
        onClick={onReset}
        className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-bold text-lg h-12"
      >
        Reset Local Data & Reload
      </Button>
    </div>
  </div>
);

export default function AppClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [bootState, setBootState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [bootError, setBootError] = useState<Error | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    async function initialize() {
      try {
        await ensureDbOpen();
        setBootState('ready');
      } catch (error: any) {
        setBootError(error);
        setBootState('error');
      }
    }
    initialize();

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

  const isLoginPage = pathname === '/login';
  const isLandingPage = pathname.startsWith('/landing');
  const isStatusPage = pathname === '/status';
  const isJobsPortal = pathname.startsWith('/jobs') || pathname.startsWith('/applications') || pathname.startsWith('/profile') || pathname.startsWith('/saved');


  if (isLoginPage || isLandingPage || isJobsPortal) {
    return <>{children}</>;
  }

  if (bootState === 'error' && bootError) {
    return <ErrorPanel error={bootError} onReset={resetLocalDatabase} />;
  }

  if (bootState === 'loading') {
    // You can keep the skeleton loader from AuthProvider or put a specific one here
    return null;
  }
  
  if(isStatusPage) {
      return (
        <>
         <IdleScreensaver />
         {children}
        </>
      )
  }

  return (
    <>
      <IdleScreensaver />
      <TerminalShell onHelpClick={() => setIsHelpOpen(true)}>
        {children}
      </TerminalShell>
      <HelpDrawer isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </>
  );
}
