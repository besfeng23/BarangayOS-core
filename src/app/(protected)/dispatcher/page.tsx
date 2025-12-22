'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is deprecated and replaced by /apps.
// It will now redirect to the new App Hub.
export default function DispatcherRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/apps');
  }, [router]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Redirecting...</h1>
      <p>Moving to the new App Hub.</p>
    </div>
  );
}
