
'use client';

import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, initializeFirestore, Firestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
let db: Firestore;

try {
    db = getFirestore(app);
} catch (e) {
    db = initializeFirestore(app, {
        localCache: { kind: 'persistent' }
    });
}


// For older SDK versions, you might see enableIndexedDbPersistence.
// We'll call it here with a catch block for robustness, though initializeFirestore handles it.
enableIndexedDbPersistence(db)
  .then(() => {
    console.log("✅ BOS Offline Persistence Enabled");
  })
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      console.error(
        '❌ Firestore offline persistence failed: Multiple tabs open. App will work, but offline data will not be saved across sessions.'
      );
    } else if (err.code == 'unimplemented') {
      console.warn(
        ' Firestore offline persistence is not available in this browser. App will work online only.'
      );
    } else {
        console.error("❌ Error enabling offline persistence: ", err);
    }
  });


const auth = getAuth(app);

export { app, db, auth };
