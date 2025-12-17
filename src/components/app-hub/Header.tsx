
"use client";

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '@/lib/firebase/client';
import { Shield, CheckCircle2, Info, Clock, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

type SystemStatus = 'online' | 'offline' | 'error';

const statusConfig: Record<SystemStatus, { text: string; className: string; description: string, icon: React.ElementType }> = {
  online: { 
    text: 'SYSTEM LIVE', 
    className: 'bg-green-600/80 border-green-500/50 text-white',
    description: 'Your data is safe and backed up to the cloud in real-time.',
    icon: CheckCircle2
  },
  offline: { 
    text: 'SAVED ON DEVICE', 
    className: 'bg-yellow-600/80 border-yellow-500/50 text-white',
    description: "You're offline. Keep working! Your data is safe on this device and will sync when you reconnect.",
    icon: ShieldCheck
  },
  error: { 
    text: 'SYNC PAUSED', 
    className: 'bg-red-600/80 border-red-500/50 text-white',
    description: "Data is not syncing to the cloud. Please check your connection and tap here to retry.",
    icon: Info
  },
};

export default function Header() {
  const [time, setTime] = useState(new Date());
  const [systemStatus, setSystemStatus] = useState<SystemStatus>('online');
  const [isNavigatorOnline, setIsNavigatorOnline] = useState(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);

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
      clearInterval(timerId);
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
        setSystemStatus('error');
      }
    }
  }, [isNavigatorOnline, isFirebaseConnected]);

  const handleStatusClick = () => {
    const currentStatusInfo = statusConfig[systemStatus];
    if (systemStatus === 'error') {
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
  const StatusIcon = currentStatus.icon;

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-700 h-20 flex items-center px-6">
      <div className="flex items-center gap-3">
        <Shield className="h-10 w-10 text-blue-400" />
        <div>
          <h1 className="text-xl font-bold text-white">BarangayOS</h1>
          <p className="text-sm text-slate-400">Digital Terminal</p>
        </div>
      </div>

      <div className="flex-1 flex justify-center items-center">
         <div className="flex items-center gap-4 text-5xl font-mono font-bold text-slate-200">
            <Clock className="w-10 h-10 text-slate-500" />
            <span>{format(time, 'hh:mm:ss')}</span>
            <span className="text-3xl text-slate-400">{format(time, 'a')}</span>
         </div>
      </div>

      <div className="flex items-center">
         <Badge 
            className={`cursor-pointer transition-all duration-300 text-lg py-2 px-4 flex items-center gap-2 ${currentStatus.className}`}
            onClick={handleStatusClick}
          >
          <StatusIcon className="w-5 h-5" />
          {currentStatus.text}
        </Badge>
      </div>
    </header>
  );
}
