
'use client';

import { useState } from 'react';
import useIdle from '@/hooks/use-idle';
import BayanihanBillboard from './BayanihanBillboard';

export default function IdleScreensaver() {
  const [isIdle, setIsIdle] = useState(false);

  // Set idle timeout to 2 minutes for demo purposes
  useIdle(() => setIsIdle(true), { timeToIdle: 120000 });

  if (isIdle) {
    // When the user comes back, they will click and the billboard will handle it.
    // We just need to reset our idle state.
    return <BayanihanBillboard onWakeUp={() => setIsIdle(false)} />;
  }

  return null; // No button, fully automatic
}
