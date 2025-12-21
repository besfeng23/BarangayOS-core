
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is not implemented in the demo.
// Redirect to the main eMango send page.
export default function DisburseAidPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/emango/send');
  }, [router]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Redirecting...</h1>
    </div>
  );
}
