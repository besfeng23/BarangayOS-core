import type {Metadata} from 'next';
import './globals.css';
import './print.css'; // Import the print styles
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'BarangayOS App Hub',
  description: 'Your central hub for all barangay services and tools.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-slate-900 text-gray-200">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
