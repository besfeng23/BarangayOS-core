
import { verifySessionCookie } from '@/lib/firebase/auth';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySessionCookie();

  if (!session) {
    redirect('/login');
  }

  return <>{children}</>;
}
