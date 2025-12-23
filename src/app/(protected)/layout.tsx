'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

  useEffect(() => {
    if (bypassAuth) return;
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router, bypassAuth]);

  if (bypassAuth) {
    return <>{children}</>;
  }

  if (loading || !user) {
    return null;
  }

  return <>{children}</>;
}
