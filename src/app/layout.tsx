'use client';

import './globals.css';
import './print.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/firebase/auth-provider';
import AuthGuard from '@/components/auth/AuthGuard';
import { usePathname } from 'next/navigation';
import { SettingsProvider } from '@/context/SettingsContext';
import IdleScreensaver from '@/components/screensaver/IdleScreensaver';
import { SyncProvider } from '@/context/SyncContext';
import MainLayout from '@/components/shell/MainLayout';
import "@/styles/print.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <html lang="en" className="dark bg-slate-950">
      <head>
        <title>BarangayOS Digital Terminal</title>
        <meta
          name="description"
          content="Your central hub for all barangay services and tools."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-background">
        <AuthProvider>
          <SettingsProvider>
            {isLoginPage ? (
              children
            ) : (
              <AuthGuard>
                <SyncProvider>
                  <IdleScreensaver />
                   <MainLayout>
                      {children}
                   </MainLayout>
                </SyncProvider>
              </AuthGuard>
            )}
            <Toaster />
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
