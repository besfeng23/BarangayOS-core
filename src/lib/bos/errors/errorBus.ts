
// A lightweight, in-memory ring buffer for recent runtime errors.
// This avoids needing a full Dexie store and migration for a simple diagnostic feature.
const MAX_ERRORS = 20;
const store: { atISO: string; source: string; message: string }[] = [];

export function recordError(source: string, message: string) {
  if (store.length >= MAX_ERRORS) {
    store.shift(); // Remove the oldest error
  }
  store.push({
    atISO: new Date().toISOString(),
    source,
    message,
  });
}

export function getRecentErrors() {
  // Return a copy, sorted with the most recent error first.
  return [...store].reverse();
}
