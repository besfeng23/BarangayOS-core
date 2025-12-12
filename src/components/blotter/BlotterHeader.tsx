"use client";

import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function BlotterHeader({ title }: { title: string }) {
  const [isOnline, setIsOnline] = useState(true);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    const timer = setInterval(() => setTime(new Date()), 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(timer);
    };
  }, []);

  return (
    <header className="flex items-center justify-between p-4 bg-[#1e1e1e] border-b border-gray-700 h-[80px]">
      <div className="flex items-center gap-4">
        <Link href="/" passHref>
          <Button variant="outline" className="h-12 w-12 bg-transparent border-gray-600 hover:bg-gray-700">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      <div className="flex items-center gap-4 text-lg">
        <div className="flex items-center gap-2">
            {isOnline ? (
                <Wifi className="text-green-500" />
            ) : (
                <WifiOff className="text-red-500" />
            )}
            <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
        </div>
        <div className="font-mono tracking-wider">
            {time.toLocaleTimeString()}
        </div>
      </div>
    </header>
  );
}
