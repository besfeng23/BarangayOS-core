'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is now a passthrough to the new public landing page.
export default function HomeRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/landing');
  }, [router]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Redirecting...</h1>
      <p>Moving to the new landing page.</p>
    </div>
  );
}
