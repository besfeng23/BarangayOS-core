
// A collection of utilities for interacting with the local database.

/**
 * Recursively traverses an object and replaces `undefined` values with `null`.
 * This is crucial because IndexedDB (and Dexie) cannot store `undefined`.
 * This function returns a new object and does not mutate the original.
 * @param obj The object to clean.
 * @returns A new object with all `undefined` values replaced by `null`.
 */
export function cleanForStorage<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => cleanForStorage(item)) as any;
  }

  if (typeof obj === 'object') {
    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = (obj as any)[key];
        if (value === undefined) {
          newObj[key] = null;
        } else {
          newObj[key] = cleanForStorage(value);
        }
      }
    }
    return newObj as T;
  }

  return obj;
}
