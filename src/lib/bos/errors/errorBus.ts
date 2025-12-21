
'use client';
const MAX_ERRORS = 20;

type ErrorRecord = {
    atISO: string;
    source: string;
    message: string;
};

let store: ErrorRecord[] = [];

// This function can be called from anywhere in the app to log a runtime error.
export function recordError(source: string, message: string) {
  // Avoid duplicating the exact same error message rapidly
  if (store.length > 0 && store[store.length - 1].message === message) {
    return;
  }

  if (store.length >= MAX_ERRORS) {
    store.shift(); // Remove the oldest error
  }
  
  store.push({
    atISO: new Date().toISOString(),
    source,
    message,
  });

  // Optionally, dispatch a global event so a live error counter can update
  window.dispatchEvent(new CustomEvent('bos-error-recorded'));
}

export function getRecentErrors(): ErrorRecord[] {
  // Return a copy, sorted with the most recent error first.
  if (typeof window === 'undefined') return store;
  return [...store].reverse();
}

export function clearRecentErrors() {
    store = [];
}
