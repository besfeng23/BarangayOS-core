'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is now a passthrough to the main app hub.
export default function HomeRedirectPage() {
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
