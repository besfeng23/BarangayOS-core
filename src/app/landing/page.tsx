
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: "BarangayOS — Digital Governance Terminal",
  description: "Offline-first barangay terminal for residents, certificates, blotter, business permits, print & sync.",
};

const GovIcon = ({ className }: { className?: string }) => (
    <svg width="40" height="48" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M50 115C50 115 90 95 90 30V10L50 0L10 10V30C10 95 50 115 50 115Z" stroke="currentColor" strokeWidth="6" fill="transparent"/>
        <circle cx="50" cy="50" r="12" fill="currentColor"/>
        <path d="M50 25L50 35M50 65L50 75M25 50L35 50M65 50L75 50M32 32L39 39M61 61L68 68M32 68L39 61M61 39L68 32" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
    </svg>
);

const FeatureIcon = ({ iconName }: { iconName: string }) => {
    // Simple placeholder for icons to avoid a new library
    const iconMap: { [key: string]: React.ReactNode } = {
        'wifi-slash': <div className="w-6 h-6 border-2 border-current rounded-full flex items-center justify-center font-bold">!</div>,
        'hand-heart': <div className="w-6 h-6 border-2 border-current rounded-full flex items-center justify-center font-bold">♥</div>,
        'printer': <div className="w-6 h-6 border-2 border-current rounded-full flex items-center justify-center font-bold">P</div>,
        'users': <div className="w-6 h-6 border-2 border-current rounded-full flex items-center justify-center font-bold">U</div>,
        'file-text': <div className="w-6 h-6 border-2 border-current rounded-full flex items-center justify-center font-bold">D</div>,
        'gavel': <div className="w-6 h-6 border-2 border-current rounded-full flex items-center justify-center font-bold">G</div>,
        'chart-bar': <div className="w-6 h-6 border-2 border-current rounded-full flex items-center justify-center font-bold">R</div>,
    };
    return iconMap[iconName] || null;
};


export default function LandingPage() {
  return (
    <div className="bg-[#050505] text-white antialiased selection:bg-[#10b981] selection:text-white">

      <style jsx global>{`
        .glass-panel {
            background: rgba(30, 41, 59, 0.4);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .hero-glow {
            background: radial-gradient(circle at center, rgba(16, 185, 129, 0.15) 0%, rgba(0,0,0,0) 70%);
        }
      `}</style>
      
      <nav className="fixed w-full z-50 top-0 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
                <Link href="/" className="flex-shrink-0 flex items-center gap-3">
                    <GovIcon className="text-white w-8 h-10" />
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white leading-none">BarangayOS</h1>
                        <span className="text-xs text-gray-400 font-medium tracking-widest uppercase">GovTech Terminal</span>
                    </div>
                </Link>

                <div className="hidden md:block">
                    <div className="ml-10 flex items-baseline space-x-8">
                        <a href="#features" className="hover:text-[#10b981] transition-colors text-sm font-medium">Core Modules</a>
                        <a href="#specs" className="hover:text-[#10b981] transition-colors text-sm font-medium">Specs</a>
                        <a href="#compliance" className="hover:text-[#10b981] transition-colors text-sm font-medium">Compliance</a>
                    </div>
                </div>

                <div>
                    <a href="#contact" className="bg-white text-black hover:bg-gray-200 px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg hover:shadow-white/20">
                        Request Deployment
                    </a>
                </div>
            </div>
        </div>
      </nav>

      <main>
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full hero-glow z-0 pointer-events-none"></div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-semibold mb-8">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    PHASE 1 DEPLOYMENT READY
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-white">
                    The Operating System for <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Modern Governance.</span>
                </h1>
                
                <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-400 mb-10">
                    Not a website. Not a download. A complete <strong>Digital Governance Terminal</strong> designed to replace logbooks, speed up clearance, and pass audits.
                </p>

                <div className="flex justify-center gap-4 mb-16">
                    <Link href="/login" className="bg-[#10b981] hover:bg-emerald-400 text-black px-8 py-4 rounded-lg text-lg font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                        Activate Trial Unit
                    </Link>
                    <Link href="/login" className="border border-white/20 hover:border-white hover:bg-white/5 px-8 py-4 rounded-lg text-lg font-medium transition-all">
                        View Demo Script
                    </Link>
                </div>

                <div className="relative mx-auto max-w-5xl">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#10b981] to-blue-600 rounded-xl blur opacity-20"></div>
                    <div className="relative rounded-xl border border-white/10 bg-gray-900 shadow-2xl overflow-hidden">
                        <Image src="https://picsum.photos/seed/dashboard/1024/576" alt="BarangayOS Dashboard Interface" width={1024} height={576} className="w-full h-auto opacity-90"/>
                    </div>
                </div>
            </div>
        </section>

        <section id="specs" className="py-20 bg-black border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="glass-panel p-8 rounded-2xl hover:border-emerald-500/50 transition-colors">
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-6">
                            <FeatureIcon iconName="wifi-slash" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Offline-First Architecture</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Internet down? No problem. Encode residents, issue permits, and log blotters offline. Syncs automatically when signal returns.
                        </p>
                    </div>
                    <div className="glass-panel p-8 rounded-2xl hover:border-blue-500/50 transition-colors">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6">
                           <FeatureIcon iconName="hand-heart" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Lola-Proof Simplicity</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Designed for non-techies. Large buttons, readable text, and zero "computer jargon." If you can use an ATM, you can use BarangayOS.
                        </p>
                    </div>
                    <div className="glass-panel p-8 rounded-2xl hover:border-purple-500/50 transition-colors">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-6">
                           <FeatureIcon iconName="printer" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Instant Documentation</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Generates official, DILG-compliant certificates and blotter reports in seconds. Print directly from the terminal.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <section id="features" className="py-24 relative overflow-hidden">
        <div id="modules"></div> {/* Alias for scrolling */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-white mb-4">Core Operating Modules</h2>
                    <p className="text-gray-400">Everything a Barangay Hall needs. Nothing it doesn't.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-900 border border-white/10 p-6 rounded-xl flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4">
                            <FeatureIcon iconName="users" />
                            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">CORE</span>
                        </div>
                        <h4 className="text-lg font-bold text-white">Resident Index</h4>
                        <p className="text-sm text-gray-500 mt-2">Searchable database of all constituents, households, and history.</p>
                    </div>
                    <div className="bg-gray-900 border border-white/10 p-6 rounded-xl flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4">
                            <FeatureIcon iconName="file-text" />
                            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">CORE</span>
                        </div>
                        <h4 className="text-lg font-bold text-white">Certificates</h4>
                        <p className="text-sm text-gray-500 mt-2">Issue Clearance, Indigency, and Residency in under 60 seconds.</p>
                    </div>
                    <div className="bg-gray-900 border border-white/10 p-6 rounded-xl flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4">
                            <FeatureIcon iconName="gavel" />
                            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">CORE</span>
                        </div>
                        <h4 className="text-lg font-bold text-white">Digital Blotter</h4>
                        <p className="text-sm text-gray-500 mt-2">Secure logging of disputes, narratives, and resolutions.</p>
                    </div>
                    <div className="bg-gray-900 border border-white/10 p-6 rounded-xl flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4">
                            <FeatureIcon iconName="chart-bar" />
                            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">CORE</span>
                        </div>
                        <h4 className="text-lg font-bold text-white">Audit Reports</h4>
                        <p className="text-sm text-gray-500 mt-2">One-click generation of weekly/monthly summaries for the Captain.</p>
                    </div>
                </div>
            </div>
        </section>
      </main>

      <footer id="contact" className="bg-gray-900 pt-20 pb-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl font-bold text-white mb-6">Ready to modernize your Barangay?</h2>
                <p className="text-gray-400 mb-8">Deploy the terminal that works as hard as you do. Secure, compliant, and ready for deployment.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <a href="mailto:deploy@barangayos.gov" className="w-full sm:w-auto bg-white text-black font-bold py-3 px-8 rounded-lg hover:bg-gray-200 transition-colors">
                        Contact Sales
                    </a>
                    <a href="#" className="w-full sm:w-auto border border-white/20 text-white font-medium py-3 px-8 rounded-lg hover:bg-white/10 transition-colors">
                        Request Specs Sheet
                    </a>
                </div>
            </div>
            <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                <div className="flex items-center gap-2 mb-4 md:mb-0">
                    <svg width="20" height="24" viewBox="0 0 100 120" fill="none" className="text-gray-500">
                        <path d="M50 115C50 115 90 95 90 30V10L50 0L10 10V30C10 95 50 115 50 115Z" stroke="currentColor" strokeWidth="8" fill="transparent"/>
                    </svg>
                    <span>&copy; 2024 BarangayOS. All rights reserved.</span>
                </div>
                <div className="flex gap-6">
                    <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
                    <Link href="/terms" className="hover:text-white">Terms of Service</Link>
                    <Link href="/compliance" className="hover:text-white">DILG Compliance</Link>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}
