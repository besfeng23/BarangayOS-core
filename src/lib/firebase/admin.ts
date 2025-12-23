
import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { bootstrap } from 'global-agent';

if (!process.env.GLOBAL_AGENT_HTTP_PROXY && (process.env.HTTPS_PROXY || process.env.HTTP_PROXY)) {
  process.env.GLOBAL_AGENT_HTTP_PROXY = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  // Ensure Firebase Admin SDK honors outbound proxy settings in constrained environments.
  bootstrap();
}

// Prefer REST transport so outbound calls respect HTTP(S) proxy settings.
if (!process.env.FIRESTORE_PREFER_REST) {
  process.env.FIRESTORE_PREFER_REST = 'true';
}

// This file is designed to be build-safe for Vercel and Next.js.
// It uses a lazy initialization pattern to ensure the Firebase Admin SDK
// is only initialized at runtime, not during the build process.

let adminApp: App | undefined;
let adminAuth: Auth | undefined;
let adminDb: Firestore | undefined;

function getAdminApp(): App {
  // If the app is already initialized, return it.
  if (adminApp) {
    return adminApp;
  }
  
  // Check if an app named 'admin' already exists. This can happen in serverless environments.
  const existingApp = getApps().find(app => app.name === 'admin');
  if (existingApp) {
    adminApp = existingApp;
    return adminApp;
  }
  
  // Prepare credentials.
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      if (!serviceAccount.project_id) {
          throw new Error("Service account JSON must contain a string 'project_id' property.");
      }
      adminApp = initializeApp({
          credential: cert(serviceAccount)
      }, 'admin');
      return adminApp;
  }

  // Fallback for local development using separate environment variables
  const serviceAccount = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
      throw new Error('Firebase Admin credentials are not available. Set FIREBASE_SERVICE_ACCOUNT_JSON or individual FIREBASE_ADMIN_* variables.');
  }

  adminApp = initializeApp({
    credential: cert(serviceAccount)
  }, 'admin');
  
  return adminApp;
}

function initializeAdmin() {
  const app = getAdminApp();
  adminAuth = getAuth(app);
  adminDb = getFirestore(app);
}

function getAdminAuthInstance() {
    if (!adminAuth) {
        initializeAdmin();
    }
    return adminAuth!;
}

function getAdminDbInstance() {
    if (!adminDb) {
        initializeAdmin();
    }
    return adminDb!;
}

export { getAdminAuthInstance as getAdminAuth, getAdminDbInstance as getAdminDb };
