import { initializeApp, getApps, getApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import type { FirebaseStorage } from 'firebase/storage';

export function getFirebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
  };
}

export function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID.includes('placeholder')
  );
}

/**
 * Strips all `undefined` fields recursively so Firestore setDoc/updateDoc
 * never throws "Unsupported field value: undefined".
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as any;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        sanitized[key] = sanitizeForFirestore(value);
      }
    }
    return sanitized as any;
  }
  return data;
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  if (!app) {
    try {
      app = getApps().length > 0 ? getApp() : initializeApp(getFirebaseConfig());
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

const firebaseConfig = getFirebaseConfig();
export { app, db, storage, firebaseConfig };
