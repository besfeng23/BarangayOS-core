
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAgNyILqGlsW1YV8OF63ubJljSZoEByMcA",
  authDomain: "studio-603796794-a3dad.firebaseapp.com",
  projectId: "studio-603796794-a3dad",
  storageBucket: "studio-603796794-a3dad.appspot.com",
  messagingSenderId: "1057904202072",
  appId: "1:1057904202072:web:0156b6def50c6badb0952d"
};

// Initialize Firebase (Singleton Pattern)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with Offline Persistence
// This enables multi-tab offline support, which is critical for the kiosk architecture.
// Data will be saved locally and synced automatically when the connection is restored.
let db;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
  console.log("✅ BOS Offline Persistence Enabled");
} catch (error) {
    if (error instanceof Error && 'code' in error && (error as {code: string}).code === 'failed-precondition') {
        console.warn("Multiple tabs open, persistence can only be enabled in one tab at a a time.");
    } else {
        console.error("Error enabling offline persistence: ", error);
    }
    // Fallback to in-memory persistence if offline fails
    db = getFirestore(app);
}


const auth = getAuth(app);

export { app, db, auth };
