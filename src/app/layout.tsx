
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/firebase/auth-provider';
import { SettingsProvider } from '@/hooks/useSettings';
import { SyncProvider } from '@/context/SyncContext';
import AppClientLayout from './AppClientLayout';

export const metadata = {
  title: "BarangayOS",
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" }
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png"
  },
  description: "Your central hub for all barangay services and tools."
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark bg-zinc-950">
      <head>
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
      <body>
        <AuthProvider>
          <SettingsProvider>
            <SyncProvider>
              <AppClientLayout>{children}</AppClientLayout>
              <Toaster />
            </SyncProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
