'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAllDrafts, Draft } from '@/lib/drafts';
import { useEventListener } from './useEventListener';

export function useDrafts() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshDrafts = useCallback(async () => {
    const allDrafts = await getAllDrafts();
    setDrafts(allDrafts);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshDrafts();
  }, [refreshDrafts]);

  // Listen for custom events that signal a draft change
  useEventListener('drafts-changed', refreshDrafts);

  return { drafts, loading, refreshDrafts };
}
