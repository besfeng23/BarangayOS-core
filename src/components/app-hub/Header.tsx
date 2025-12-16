
"use client";

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '@/lib/firebase/client';

type SystemStatus = 'online' | 'offline' | 'reconnecting' | 'error';

const statusConfig = {
  online: { text: '🟢 SYNCED', className: 'bg-green-600/80 border-green-500/50 text-white' },
  offline: { text: '🟡 SAVED ON DEVICE', className: 'bg-yellow-600/80 border-yellow-500/50 text-white' },
  reconnecting: { text: '🟠 RECONNECTING...', className: 'bg-orange-600/80 border-orange-500/50 text-white' },
  error: { text: '🔴 NEEDS SIGNAL', className: 'bg-red-600/80 border-red-500/50 text-white' },
};

export default function Header() {
  const [greeting, setGreeting] = useState('');
  const [systemStatus, setSystemStatus] = useState<SystemStatus>('online');
  const [isNavigatorOnline, setIsNavigatorOnline] = useState(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Good Morning';
      if (hour < 18) return 'Good Afternoon';
      return 'Good Evening';
    };
    setGreeting(getGreeting());

    // 1. Listen to browser's online/offline status
    const handleNavigatorStatusChange = () => {
        setIsNavigatorOnline(navigator.onLine);
    };
    window.addEventListener('online', handleNavigatorStatusChange);
    window.addEventListener('offline', handleNavigatorStatusChange);
    handleNavigatorStatusChange(); // Set initial status

    // 2. Listen to Firebase Realtime Database connectivity state
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
    // Determine the final system status based on both listeners
    if (!isNavigatorOnline) {
      setSystemStatus('offline');
    } else {
      if (isFirebaseConnected) {
        setSystemStatus('online');
      } else {
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
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-lg border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {greeting}
            </h1>
            <p className="text-muted-foreground">Welcome to the BarangayOS App Hub</p>
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
