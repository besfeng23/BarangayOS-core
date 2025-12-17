
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const defaultEvents: (keyof WindowEventMap)[] = [
  'mousemove',
  'mousedown',
  'resize',
  'keydown',
  'touchstart',
  'wheel',
];

interface UseIdleOptions {
  events?: (keyof WindowEventMap)[];
  initialState?: boolean;
  timeToIdle?: number;
}

const useIdle = (
  onIdle: () => void,
  {
    events = defaultEvents,
    initialState = false,
    timeToIdle = 60000, // 1 minute
  }: UseIdleOptions = {}
) => {
  const [isIdle, setIsIdle] = useState(initialState);
  const timeoutId = useRef<number | null>(null);

  const handleEvent = useCallback(() => {
    setIsIdle(false);

    if (timeoutId.current) {
      window.clearTimeout(timeoutId.current);
    }

    timeoutId.current = window.setTimeout(() => {
      setIsIdle(true);
      onIdle();
    }, timeToIdle);
  }, [timeToIdle, onIdle]);

  useEffect(() => {
    handleEvent(); // Initial call to start the timer

    for (const event of events) {
      window.addEventListener(event, handleEvent);
    }

    return () => {
      for (const event of events) {
        window.removeEventListener(event, handleEvent);
      }
      if (timeoutId.current) {
        window.clearTimeout(timeoutId.current);
      }
    };
  }, [events, handleEvent]);

  return isIdle;
};

export default useIdle;
