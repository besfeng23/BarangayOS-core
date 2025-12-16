
"use client";

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

type SystemStatus = 'online' | 'offline' | 'error';

const statusConfig = {
  online: { text: '🟢 SYNCED', className: 'bg-green-600/80 border-green-500/50 text-white' },
  offline: { text: '🟡 SAVED ON DEVICE', className: 'bg-yellow-600/80 border-yellow-500/50 text-white' },
  error: { text: '🔴 NEEDS SIGNAL', className: 'bg-red-600/80 border-red-500/50 text-white' },
};

export default function Header() {
  const [greeting, setGreeting] = useState('');
  const [systemStatus, setSystemStatus] = useState<SystemStatus>('online');
  const { toast } = useToast();


  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Good Morning';
      if (hour < 18) return 'Good Afternoon';
      return 'Good Evening';
    };
    setGreeting(getGreeting());

    // Mock status changes for demonstration
    const interval = setInterval(() => {
      setSystemStatus(prevStatus => {
        if (prevStatus === 'online') return 'offline';
        if (prevStatus === 'offline') return 'error';
        return 'online';
      });
    }, 10000); // Change status every 10 seconds

    return () => clearInterval(interval);

  }, []);

  const handleStatusClick = () => {
    let description = '';
    switch(systemStatus) {
      case 'online':
        description = 'All data is up to date.';
        break;
      case 'offline':
        description = 'Your data is saved locally and will sync when the signal returns.';
        break;
      case 'error':
        description = 'There was an issue syncing. Please check your network connection.';
        break;
    }
    toast({
      title: 'System Status',
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
