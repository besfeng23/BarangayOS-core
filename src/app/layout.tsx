
'use client'

import './globals.css';
import './print.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/firebase/auth-provider';
import AuthGuard from '@/components/auth/AuthGuard';
import { usePathname } from 'next/navigation';
import Header from '@/components/app-hub/Header';
import { SettingsProvider } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Printer } from 'lucide-react';
import Link from 'next/link';


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <html lang="en" className="dark">
      <head>
        <title>BarangayOS Digital Terminal</title>
        <meta name="description" content="Your central hub for all barangay services and tools." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-background">
        <AuthProvider>
          <SettingsProvider>
            {isLoginPage ? (
                children
            ) : (
                <AuthGuard>
                    <div className="flex flex-col h-screen bg-background text-foreground">
                        <Header />
                        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                            {children}
                        </main>
                        {/* Bottom Navigation */}
                        <footer className="fixed bottom-0 left-0 right-0 h-24 bg-slate-900/80 backdrop-blur-lg border-t border-slate-700 flex items-center justify-around z-50">
                            <Link href="/" passHref>
                                <Button variant="ghost" className="flex flex-col h-auto p-4 gap-1 text-lg">
                                    <Home className="w-8 h-8" />
                                    <span>MAIN MENU</span>
                                </Button>
                            </Link>
                             <Button variant="ghost" className="flex flex-col h-auto p-4 gap-1 text-lg" disabled>
                                <Printer className="w-8 h-8" />
                                <span>PRINT DOC</span>
                            </Button>
                            <Link href="/" passHref>
                                <Button variant="ghost" className="flex flex-col h-auto p-4 gap-1 text-lg">
                                    <ArrowLeft className="w-8 h-8" />
                                    <span>GO BACK</span>
                                </Button>
                            </Link>
                        </footer>
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
