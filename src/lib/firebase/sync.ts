import { getFirebaseDb } from './config';
import { doc, writeBatch } from 'firebase/firestore';
import { SEED_PRODUCTS, SEED_CATEGORIES, SEED_COLLECTIONS, SEED_CATALOGS, SEED_CUSTOMERS } from '@/lib/data/seed-data';

export async function syncSeedDataToFirestore() {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error('Firebase Firestore is not configured. Please check your Firebase environment variables.');
  }

  const batch = writeBatch(db);

  // 1. Categories
  for (const cat of SEED_CATEGORIES) {
    const ref = doc(db, 'categories', cat.id);
    batch.set(ref, cat, { merge: true });
  }

  // 2. Collections
  for (const col of SEED_COLLECTIONS) {
    const ref = doc(db, 'collections', col.id);
    batch.set(ref, col, { merge: true });
  }

  // 3. Customers
  for (const cust of SEED_CUSTOMERS) {
    const ref = doc(db, 'customers', cust.id);
    batch.set(ref, cust, { merge: true });
  }

  // 4. Products
  for (const prod of SEED_PRODUCTS) {
    const ref = doc(db, 'products', prod.id);
    batch.set(ref, prod, { merge: true });
  }

  // 5. Catalogs
  for (const catalog of SEED_CATALOGS) {
    const ref = doc(db, 'catalogs', catalog.id);
    batch.set(ref, catalog, { merge: true });
  }

  await batch.commit();
  return { success: true, count: SEED_PRODUCTS.length };
}
