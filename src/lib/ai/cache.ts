'use client';
import { db } from '@/lib/bosDb';
import { hashQuery } from '@/lib/hash';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function getCachedAIResponse<T>(prompt: string): Promise<T | null> {
  try {
    const key = await hashQuery(prompt);
    const cached = await db.ai_cache.get(key);

    if (cached && (Date.now() - cached.createdAt) < CACHE_TTL_MS) {
      return cached.value as T;
    }
    
    // Clean up expired entry if found
    if (cached) {
      await db.ai_cache.delete(key);
    }

    return null;
  } catch (error) {
    console.error("Error getting AI response from cache:", error);
    return null;
  }
}

export async function setCachedAIResponse<T>(prompt: string, response: T): Promise<void> {
  try {
    const key = await hashQuery(prompt);
    await db.ai_cache.put({
      key,
      value: response,
      createdAt: Date.now(),
    });
  } catch (error) {
    console.error("Error setting AI response in cache:", error);
  }
}
