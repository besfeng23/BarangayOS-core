
'use client'

import './globals.css';
import './print.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/firebase/auth-provider';
import AuthGuard from '@/components/auth/AuthGuard';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/app-hub/Sidebar';
import Header from '@/components/app-hub/Header';
import { SettingsProvider } from '@/context/SettingsContext';


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

   // All pages except login now use the standard layout with Sidebar and Header.
  const isSpecialLayout = ['/blotter-legacy', '/permits-legacy', '/city-health-legacy', '/city-health/queue-legacy'].includes(pathname);

   if (isSpecialLayout) {
    return (
      <html lang="en" className="dark">
        <head>
          <title>BarangayOS App Hub</title>
          <meta name="description" content="Your central hub for all barangay services and tools." />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
        </head>
        <body className="font-sans antialiased">
          <AuthProvider>
            <SettingsProvider>
              {isLoginPage ? (
                  children
              ) : (
                  <AuthGuard>
                     {children}
                  </AuthGuard>
              )}
              <Toaster />
            </SettingsProvider>
          </AuthProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className="dark">
      <head>
        <title>BarangayOS App Hub</title>
        <meta name="description" content="Your central hub for all barangay services and tools." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          <SettingsProvider>
            {isLoginPage ? (
                children
            ) : (
                <AuthGuard>
                    <div className="flex h-screen bg-slate-950 text-gray-200">
                        <Sidebar />
                        <div className="flex flex-col flex-1 overflow-hidden">
                            <Header />
                            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                                {children}
                            </main>
                        </div>
                    </div>
                </AuthGuard>
            )}
            <Toaster />
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
