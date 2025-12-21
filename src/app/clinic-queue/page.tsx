'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is now a passthrough to the main city health page.
export default function ClinicQueueRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/city-health');
  }, [router]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Redirecting...</h1>
      <p>The clinic queue has been moved to the City Health module.</p>
    </div>
  );
}
