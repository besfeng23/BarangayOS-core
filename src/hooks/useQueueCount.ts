'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPendingCount } from '@/lib/syncQueue';
import { useEventListener } from './useEventListener';

export function useQueueCount(entityType?: string) {
  const [count, setCount] = useState(0);

  const refreshCount = useCallback(async () => {
    const pendingCount = await getPendingCount(entityType);
    setCount(pendingCount);
  }, [entityType]);

  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  // Listen for custom events that signal a queue change
  useEventListener('queue-changed', refreshCount);

  return count;
}
