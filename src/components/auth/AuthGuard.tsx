
'use client';

import React, { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    // This state is already handled by the AuthProvider,
    // so we can just return null or a minimal loader here.
    return null;
  }

  if (!user) {
    router.push('/login');
    return null; // Don't render children if not authenticated
  }

  return <>{children}</>;
};

export default AuthGuard;
