import { getFirebaseAdminDb } from './admin';
import { SEED_PRODUCTS, SEED_CATEGORIES, SEED_COLLECTIONS, SEED_CATALOGS, SEED_CUSTOMERS } from '@/lib/data/seed-data';

export async function syncSeedDataToFirestore() {
  const db = getFirebaseAdminDb();
  if (!db) {
    throw new Error('Firebase Admin DB is not configured. Please set Firebase environment variables.');
  }

  const batch = db.batch();

  // 1. Categories
  for (const cat of SEED_CATEGORIES) {
    const ref = db.collection('categories').doc(cat.id);
    batch.set(ref, cat, { merge: true });
  }

  // 2. Collections
  for (const col of SEED_COLLECTIONS) {
    const ref = db.collection('collections').doc(col.id);
    batch.set(ref, col, { merge: true });
  }

  // 3. Customers
  for (const cust of SEED_CUSTOMERS) {
    const ref = db.collection('customers').doc(cust.id);
    batch.set(ref, cust, { merge: true });
  }

  // 4. Products
  for (const prod of SEED_PRODUCTS) {
    const ref = db.collection('products').doc(prod.id);
    batch.set(ref, prod, { merge: true });
  }

  // 5. Catalogs
  for (const catalog of SEED_CATALOGS) {
    const ref = db.collection('catalogs').doc(catalog.id);
    batch.set(ref, catalog, { merge: true });
  }

  await batch.commit();
  return { success: true, count: SEED_PRODUCTS.length };
}
