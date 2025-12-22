
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, Firestore } from "firebase/firestore";
import { getAuth, Auth, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { env } from "@/lib/env";

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
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
// Set session persistence
setPersistence(auth, browserLocalPersistence);

const storage: FirebaseStorage = getStorage(app);

export { app, db, auth, storage, db as firestore };
