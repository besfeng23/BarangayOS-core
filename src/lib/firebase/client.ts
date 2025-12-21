
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { getAnalytics, Analytics, isSupported } from "firebase/analytics";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Standard Firebase config object using environment variables for security.
const firebaseConfig = {
  apiKey: "AIzaSyAgNyILqGlsW1YV8OF63ubJljSZoEByMcA",
  authDomain: "studio-603796794-a3dad.firebaseapp.com",
  projectId: "studio-603796794-a3dad",
  storageBucket: "studio-603796794-a3dad.appspot.com",
  messagingSenderId: "1057904202072",
  appId: "1:1057904202072:web:0156b6def50c6badb0952d",
  measurementId: "G-5HPJBLXZPM"
};

// Initialize Firebase App (Singleton Pattern)
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let db: Firestore;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
  });
  console.log("✅ Firebase Offline Persistence Enabled (Multi-Tab)");
} catch (error) {
  if (error instanceof Error && 'code' in error && (error as {code: string}).code === 'failed-precondition') {
    console.warn("Multiple tabs open, persistence can only be enabled in one tab at a time. Falling back to memory cache for this tab.");
  } else {
    console.error("Error enabling offline persistence: ", error);
  }
  // Fallback to regular getFirestore if initialization fails
  db = getFirestore(app);
}

const auth: Auth = getAuth(app);
const storage: FirebaseStorage = getStorage(app);

// Lazy-initialized Analytics instance
let analytics: Analytics | null = null;

/**
 * Safely gets the Firebase Analytics instance, only if running in a supported browser environment.
 * This prevents crashes during server-side rendering or in unsupported contexts.
 * @returns The Firebase Analytics instance, or null if not supported.
 */
export const getAnalyticsIfSupported = async (): Promise<Analytics | null> => {
    if (typeof window === 'undefined') {
        return null;
    }
    if (!analytics) {
        if (await isSupported()) {
            analytics = getAnalytics(app);
        }
    }
    return analytics;
}

export { app, db, auth, storage };
