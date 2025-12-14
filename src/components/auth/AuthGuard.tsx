
'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);


  if (loading) {
    // AuthProvider shows a skeleton, so we can just wait here.
    return null;
  }

  if (!user) {
    // Don't render children if not authenticated, useEffect will redirect.
    return null; 
  }

  return <>{children}</>;
};

export default AuthGuard;
