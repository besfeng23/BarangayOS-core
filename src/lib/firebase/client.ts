
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
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

const auth = getAuth(app);

console.log("✅ BOS Offline Persistence Enabled");

export { app, db, auth };
