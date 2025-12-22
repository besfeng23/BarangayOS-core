'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is a redirect to the correct, protected print center page
// to resolve the routing conflict.
export default function PrintRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/(protected)/print');
  }, [router]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Redirecting...</h1>
      <p>Moving to the Print Center.</p>
    </div>
  );
}
