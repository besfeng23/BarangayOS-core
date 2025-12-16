
"use client";

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '@/lib/firebase/client';
import { usePathname } from 'next/navigation';

type SystemStatus = 'online' | 'offline' | 'error';

const statusConfig: Record<SystemStatus, { text: string; className: string; description: string }> = {
  online: { 
    text: '🟢 SYNCED', 
    className: 'bg-green-600/80 border-green-500/50 text-white',
    description: 'Your data is safe and backed up to the cloud in real-time.'
  },
  offline: { 
    text: '🟡 SAVED ON DEVICE', 
    className: 'bg-yellow-600/80 border-yellow-500/50 text-white',
    description: "You're offline. Keep working! Your data is safe on this device and will sync when you reconnect."
  },
  error: { 
    text: '🔴 SYNC FAILED', 
    className: 'bg-red-600/80 border-red-500/50 text-white',
    description: "Data is not syncing to the cloud. Please check your connection and tap here to retry."
  },
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

    // Firebase Realtime Database connection check
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
    // This logic determines the final status based on both checks.
    // The 'error' state would be triggered by failed writes, which we simulate here.
    if (!isNavigatorOnline) {
      setSystemStatus('offline');
    } else {
      if (isFirebaseConnected) {
        setSystemStatus('online');
      } else {
        // We are connected to a network, but not to Firebase servers.
        // This is a more specific error condition. For v1, we map this to 'offline' for simplicity.
        // A future version could use this for a 'reconnecting' state.
        setSystemStatus('offline'); 
      }
    }
  }, [isNavigatorOnline, isFirebaseConnected]);

  const handleStatusClick = () => {
    const currentStatusInfo = statusConfig[systemStatus];
    
    // In a real implementation, clicking on 'error' would trigger a retry mechanism.
    if (systemStatus === 'error') {
       // e.g., retryPendingWrites();
       toast({
          title: "Retrying Sync...",
          description: "Attempting to sync your pending data to the cloud.",
        });
    } else {
       toast({
        title: `Status: ${currentStatusInfo.text}`,
        description: currentStatusInfo.description,
      });
    }
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
