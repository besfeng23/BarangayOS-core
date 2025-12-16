
"use client";

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '@/lib/firebase/client';
import { usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type SystemStatus = 'online' | 'offline' | 'reconnecting' | 'error';

const statusConfig = {
  online: { text: '🟢 SYNCED', className: 'bg-green-600/80 border-green-500/50 text-white' },
  offline: { text: '🟡 SAVED ON DEVICE', className: 'bg-yellow-600/80 border-yellow-500/50 text-white' },
  reconnecting: { text: '🟠 RECONNECTING...', className: 'bg-orange-600/80 border-orange-500/50 text-white' },
  error: { text: '🔴 NEEDS SIGNAL', className: 'bg-red-600/80 border-red-500/50 text-white' },
};

const getPageTitle = (path: string): string => {
    if (path === '/') return 'App Hub';
    const segment = path.split('/').pop()?.replace(/-/g, ' ');
    return segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : 'Dashboard';
}

export default function Header() {
  const [greeting, setGreeting] = useState('');
  const [systemStatus, setSystemStatus] = useState<SystemStatus>('online');
  const [isNavigatorOnline, setIsNavigatorOnline] = useState(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true);
  const { toast } = useToast();
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const isHub = pathname === '/';

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Good Morning';
      if (hour < 18) return 'Good Afternoon';
      return 'Good Evening';
    };
    setGreeting(getGreeting());

    const handleNavigatorStatusChange = () => {
        setIsNavigatorOnline(navigator.onLine);
    };
    window.addEventListener('online', handleNavigatorStatusChange);
    window.addEventListener('offline', handleNavigatorStatusChange);
    handleNavigatorStatusChange(); 

    const connectedRef = ref(rtdb, '.info/connected');
    const unsubscribe = onValue(connectedRef, (snap) => {
      const isConnected = snap.val() === true;
      setIsFirebaseConnected(isConnected);
    });

    return () => {
      window.removeEventListener('online', handleNavigatorStatusChange);
      window.removeEventListener('offline', handleNavigatorStatusChange);
      unsubscribe();
    };

  }, []);
  
  useEffect(() => {
    if (!isNavigatorOnline) {
      setSystemStatus('offline');
    } else {
      if (isFirebaseConnected) {
        setSystemStatus('online');
      } else {
        // This state indicates WiFi is on, but Firebase is unreachable.
        setSystemStatus('reconnecting');
      }
    }
  }, [isNavigatorOnline, isFirebaseConnected]);

  const handleStatusClick = () => {
    let description = '';
    switch(systemStatus) {
      case 'online':
        description = 'All data is up to date and syncing with the cloud in real-time.';
        break;
      case 'offline':
        description = 'You are currently offline. All changes are being saved securely on this device and will sync automatically when connection returns.';
        break;
       case 'reconnecting':
        description = 'You appear to be connected to a network, but we are having trouble reaching the server. Checking connection...';
        break;
      case 'error':
        description = 'There was a persistent issue syncing. Please check your network connection.';
        break;
    }
    toast({
      title: `System Status: ${statusConfig[systemStatus].text}`,
      description,
    });
  };

  const currentStatus = statusConfig[systemStatus];

  return (
    <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700">
      <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex-shrink-0">
             {isHub ? (
                 <>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        {greeting}
                    </h1>
                    <p className="text-muted-foreground">Welcome to the BarangayOS App Hub</p>
                 </>
             ) : (
                <div className="flex items-center gap-4">
                     <Link href="/" passHref>
                        <Button variant="outline" size="icon">
                            <ArrowLeft />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        {pageTitle}
                    </h1>
                </div>
             )}
          </div>
          <div className="ml-4">
             <Badge 
                className={`cursor-pointer transition-all duration-300 ${currentStatus.className}`}
                onClick={handleStatusClick}
              >
              {currentStatus.text}
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}
