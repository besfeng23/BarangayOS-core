
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAgNyILqGlsW1YV8OF63ubJljSZoEByMcA",
  authDomain: "studio-603796794-a3dad.firebaseapp.com",
  projectId: "studio-603796794-a3dad",
  storageBucket: "studio-603796794-a3dad.appspot.com",
  messagingSenderId: "1057904202072",
  appId: "1:1057904202072:web:0156b6def50c6badb0952d",
  databaseURL: "https://studio-603796794-a3dad-default-rtdb.firebaseio.com"
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
        // If persistence fails, we still get an instance of Firestore, just without multi-tab persistence.
        db = getFirestore(app);
    } else {
        console.error("Error enabling offline persistence: ", error);
        // Fallback to in-memory persistence if offline setup fails for other reasons
        db = getFirestore(app);
    }
}

const auth = getAuth(app);
const rtdb = getDatabase(app);

export { app, db, auth, rtdb };
