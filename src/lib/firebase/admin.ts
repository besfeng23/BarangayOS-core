
import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { env } from '@/lib/env';

let adminApp: App;
let adminAuth: Auth;
let adminDb: Firestore;

function getAdminApp(): App {
  if (getApps().some(app => app.name === 'admin')) {
    return getApp('admin');
  }

  const serviceAccount = {
    projectId: env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
      if (process.env.NODE_ENV === 'production') {
        // In production (Vercel deployment), if creds are missing, something is wrong with env vars.
        throw new Error('Firebase Admin credentials are not configured.');
      }
      // During build or in dev without creds, we can use a placeholder or mock if needed,
      // but for now, we'll just prevent crashing. Here we throw to signal a runtime misconfiguration.
      // The build process itself won't hit this because we're initializing lazily.
       throw new Error('Firebase Admin credentials are not available. Ensure server environment variables are set.');
  }

  return initializeApp({
    credential: cert(serviceAccount)
  }, 'admin');
}

function initializeAdmin() {
    adminApp = getAdminApp();
    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);
}

// Check if already initialized before trying to initialize.
// This is the gatekeeper.
if (!getApps().some(app => app.name === 'admin')) {
    // We only call the initialization function if the admin app isn't already there.
    // However, to be build-safe, we should avoid initializing here at the top level.
    // The logic is moved into accessor functions.
}

// Export functions that ensure initialization before returning the instance.
function getAdminAuth() {
    if (!adminAuth) {
        initializeAdmin();
    }
    return adminAuth;
}

function getAdminDb() {
    if (!adminDb) {
        initializeAdmin();
    }
    return adminDb;
}

export { getAdminAuth, getAdminDb };
