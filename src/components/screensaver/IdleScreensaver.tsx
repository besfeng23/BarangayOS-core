
'use client';

import { useState } from 'react';
import useIdle from '@/hooks/use-idle';
import BayanihanBillboard from './BayanihanBillboard';
import { Button } from '../ui/button';

export default function IdleScreensaver() {
  const [isIdle, setIsIdle] = useState(false);

  // Set idle timeout to 2 minutes
  useIdle(() => setIsIdle(true), { timeToIdle: 120000 });

  if (isIdle) {
    return <BayanihanBillboard />;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
        <Button onClick={() => setIsIdle(true)} variant="outline" size="sm">Start Screensaver</Button>
    </div>
  );
}
