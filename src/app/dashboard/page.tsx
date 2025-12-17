
import Link from 'next/link';

export default function DashboardPage() {
  // This page is now a passthrough to the main app page which is the new dashboard.
  // In a real app, you might have role-based logic here to redirect.
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Redirecting...</h1>
      <p>Returning to the main dashboard.</p>
       <div className="mt-4">
        <Link href="/" passHref>Click here if you are not redirected.</Link>
      </div>
    </div>
  );
}
