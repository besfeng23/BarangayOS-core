
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { getAnalytics, Analytics, isSupported } from "firebase/analytics";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Standard Firebase config object using environment variables for security.
const fallbackFirebaseConfig = {
  apiKey: "AIzaSyDUMMYKEY00000000000000000000000000",
  authDomain: "bos-fallback.local",
  projectId: "bos-fallback",
  storageBucket: "bos-fallback.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000",
  measurementId: "G-0000000000",
};

const envFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const firebaseConfig = {
  apiKey: envFirebaseConfig.apiKey || fallbackFirebaseConfig.apiKey,
  authDomain: envFirebaseConfig.authDomain || fallbackFirebaseConfig.authDomain,
  projectId: envFirebaseConfig.projectId || fallbackFirebaseConfig.projectId,
  storageBucket: envFirebaseConfig.storageBucket || fallbackFirebaseConfig.storageBucket,
  messagingSenderId: envFirebaseConfig.messagingSenderId || fallbackFirebaseConfig.messagingSenderId,
  appId: envFirebaseConfig.appId || fallbackFirebaseConfig.appId,
  measurementId: envFirebaseConfig.measurementId || fallbackFirebaseConfig.measurementId,
};

const missingConfigKeys = Object.entries(envFirebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingConfigKeys.length) {
  console.warn(
    `[firebase] Using fallback configuration; missing env vars: ${missingConfigKeys.join(", ")}`
  );
}

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

export const firestore = db;

export { app, db, auth, storage };
