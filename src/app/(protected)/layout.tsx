
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Only redirect if we're sure the user is unauthenticated (not loading)
    if (!loading && !user && !isRedirecting) {
      setIsRedirecting(true);
      router.push('/login');
    }
  }, [user, loading, router, isRedirecting]);

  // Show loading skeleton while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 p-4 md:p-6">
        <div className="mx-auto w-full max-w-3xl space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-8 w-64 bg-zinc-800" />
              <Skeleton className="h-4 w-48 mt-2 bg-zinc-800" />
            </div>
            <Skeleton className="h-10 w-32 bg-zinc-800" />
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <Skeleton className="h-14 w-full bg-zinc-800" />
          </div>
          <div className="mt-4 space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                <Skeleton className="h-6 w-3/4 bg-zinc-800" />
                <Skeleton className="h-4 w-1/2 mt-2 bg-zinc-800" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // If user is not authenticated and we're redirecting, show loading state
  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">Redirecting to login...</div>
      </div>
    );
  }

  return <>{children}</>;
}
