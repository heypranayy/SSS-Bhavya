import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID.includes('placeholder')
  );
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  if (!app) {
    try {
      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    } catch (err) {
      console.error('Firebase initialization error:', err);
    }
  }
  return app;
}

export function getFirebaseDb(): Firestore | null {
  const currentApp = getFirebaseApp();
  if (!currentApp) return null;
  if (!db) {
    try {
      db = getFirestore(currentApp);
    } catch (err) {
      console.error('Firestore initialization error:', err);
    }
  }
  return db;
}

export function getFirebaseStorageInstance(): FirebaseStorage | null {
  const currentApp = getFirebaseApp();
  if (!currentApp) return null;
  if (!storage) {
    try {
      storage = getStorage(currentApp);
    } catch (err) {
      console.error('Firebase Storage initialization error:', err);
    }
  }
  return storage;
}

// Initialise in browser if available
if (typeof window !== 'undefined' && isFirebaseConfigured()) {
  getFirebaseApp();
  getFirebaseDb();
  getFirebaseStorageInstance();
}

export { app, db, storage, firebaseConfig };
