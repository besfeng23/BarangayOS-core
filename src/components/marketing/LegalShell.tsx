
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const GovIcon = ({ className }: { className?: string }) => (
    <svg width="40" height="48" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M50 115C50 115 90 95 90 30V10L50 0L10 10V30C10 95 50 115 50 115Z" stroke="currentColor" strokeWidth="6" fill="transparent"/>
        <circle cx="50" cy="50" r="12" fill="currentColor"/>
        <path d="M50 25L50 35M50 65L50 75M25 50L35 50M65 50L75 50M32 32L39 39M61 61L68 68M32 68L39 61M61 39L68 32" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
    </svg>
);

export default function LegalShell({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-background text-foreground antialiased min-h-screen">
      <header className="fixed w-full z-50 top-0 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
                <Link href="/landing" className="flex-shrink-0 flex items-center gap-3">
                    <GovIcon className="text-primary w-8 h-10" />
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground leading-none">BarangayOS</h1>
                        <span className="text-xs text-muted-foreground font-medium tracking-widest uppercase">GovTech Terminal</span>
                    </div>
                </Link>
                <Link href="/landing" className="bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg hover:shadow-primary/20">
                    <ArrowLeft className="inline-block mr-2 h-4 w-4" />
                    Back to Main
                </Link>
            </div>
        </div>
      </header>

      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold text-foreground mb-8">{title}</h1>
            {children}
        </div>
      </main>
      
       <footer className="bg-card pt-20 pb-10 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
                <div className="flex items-center gap-2 mb-4 md:mb-0">
                    <GovIcon className="text-muted-foreground h-6" />
                    <span>&copy; 2024 BarangayOS. All rights reserved.</span>
                </div>
                <div className="flex gap-6">
                    <Link href="/landing/privacy" className="hover:text-foreground">Privacy Policy</Link>
                    <Link href="/landing/terms" className="hover:text-foreground">Terms of Service</Link>
                    <Link href="/landing/compliance" className="hover:text-foreground">DILG Compliance</Link>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}
