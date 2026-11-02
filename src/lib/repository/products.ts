import fs from 'fs';
import path from 'path';
import { Product, Category, Collection } from '@/types';
import { SEED_CATEGORIES, SEED_COLLECTIONS, SEED_PRODUCTS } from '@/lib/data/seed-data';
import { createAdminClient } from '@/lib/supabase/admin';
import { getFirebaseDb, isFirebaseConfigured, sanitizeForFirestore } from '@/lib/firebase/config';
import { collection, getDocs, getDoc, doc, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { getSiteSettings } from './settings';

// In-memory product cache for seamless offline / zero-setup mode
let inMemoryProducts: Product[] = [...SEED_PRODUCTS];
let inMemoryCollections: Collection[] = [...SEED_COLLECTIONS];
let inMemoryCategories: Category[] = [...SEED_CATEGORIES];
const inMemoryDeletedProductIds: Set<string> = new Set();

function getCustomProductsFilePath(): string {
  return path.join(process.cwd(), 'src', 'lib', 'data', 'custom-products.json');
}

function loadPersistedProducts(): Product[] {
  try {
    const filePath = getCustomProductsFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      if (data.trim()) return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read custom products:', err);
  }
  return [];
}

function savePersistedProducts(products: Product[]): void {
  try {
    const filePath = getCustomProductsFilePath();
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write custom products:', err);
  }
}

function getDeletedProductsFilePath(): string {
  return path.join(process.cwd(), 'src', 'lib', 'data', 'deleted-products.json');
}

function loadDeletedProductIds(): Set<string> {
  const result = new Set<string>(inMemoryDeletedProductIds);
  try {
    const filePath = getDeletedProductsFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      if (data.trim()) {
        const arr = JSON.parse(data);
        if (Array.isArray(arr)) {
          arr.forEach((id) => {
            if (id && typeof id === 'string' && id.trim()) {
              result.add(id.trim());
            }
          });
        }
      }
    }
  } catch {}
  return result;
}

function saveDeletedProductIds(ids: Set<string>): void {
  try {
    const filePath = getDeletedProductsFilePath();
    fs.writeFileSync(filePath, JSON.stringify(Array.from(ids), null, 2), 'utf-8');
  } catch {}
}

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && !url.includes('placeholder') && !url.includes('your-project-id'));
}

export async function getAllProducts(): Promise<Product[]> {
  const deletedIds = loadDeletedProductIds();

  // If Cloud Firestore is configured, also fetch permanently deleted IDs from Firestore system metadata
  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseDb();
      if (db) {
        const metaSnap = await getDoc(doc(db, 'system_metadata', 'deleted_products'));
        if (metaSnap.exists()) {
          const remoteIds = metaSnap.data()?.ids;
          if (Array.isArray(remoteIds)) {
            remoteIds.forEach((id: string) => {
              if (id && typeof id === 'string' && id.trim()) {
                const cleanId = id.trim();
                deletedIds.add(cleanId);
                inMemoryDeletedProductIds.add(cleanId);
              }
            });
          }
        }
      }
    } catch (err) {
      console.warn('Firebase deleted IDs metadata fetch fallback:', err);
    }
  }

  const isDeleted = (p: { id?: string; code?: string; is_deleted?: boolean; is_active?: boolean }) => {
    if (!p) return true;
    if (p.is_deleted === true) return true;
    if (p.is_active === false) return true;
    if (p.id && deletedIds.has(p.id)) return true;
    if (p.code && deletedIds.has(p.code)) return true;
    return false;
  };

  const persisted = loadPersistedProducts();
  const mergedMap = new Map<string, Product>();

  // 1. Seed products
  for (const p of SEED_PRODUCTS) {
    if (!isDeleted(p)) {
      mergedMap.set(p.id, p);
    }
  }

  // 2. In-memory products
  for (const p of inMemoryProducts) {
    if (!isDeleted(p)) {
      mergedMap.set(p.id, p);
    }
  }

  // 3. Persisted custom products
  for (const p of persisted) {
    if (!isDeleted(p)) {
      mergedMap.set(p.id, p);
    }
  }

  // 4. Primary: Cloud Firestore
  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseDb();
      if (db) {
        const snap = await getDocs(collection(db, 'products'));
        if (!snap.empty) {
          snap.forEach((docSnap) => {
            const docId = docSnap.id;
            const data = docSnap.data() as Product;
            const pId = data.id || docId;
            const pCode = data.code;
            if (deletedIds.has(docId) || isDeleted(data) || (pId && deletedIds.has(pId)) || (pCode && deletedIds.has(pCode))) {
              return;
            }
            mergedMap.set(pId, {
              ...data,
              id: pId,
              price_on_enquiry: data.price_on_enquiry ?? true,
              price_on_request: data.price_on_enquiry ?? true,
              price_display_mode: (data.price_on_enquiry ?? true) ? 'request' : (data.price_display_mode || 'request'),
            });
          });
        }
      }
    } catch (err) {
      console.warn('Firebase products fetch fallback:', err);
    }
  }

  // 5. Supabase fallback
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          variants:product_variants(*),
          collections:product_collections(collection:collections(*))
        `)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        data.forEach((p: any) => {
          if (!isDeleted(p)) {
            mergedMap.set(p.id, {
              ...p,
              price_display_mode: p.price_display_mode || 'request',
              images: p.images || [],
              variants: p.variants || [],
              collections: p.collections?.map((c: any) => c.collection) || [],
            });
          }
        });
      }
    } catch {}
  }

  const all = Array.from(mergedMap.values()).filter((p) => !isDeleted(p));

  // Sort newest first so recently added products are always at the top
  all.sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return timeB - timeA;
  });

  inMemoryProducts = all;

  // Check global site settings: by default, prices on main website are ALWAYS BLOCKED
  let mainWebsiteShowPrices = false;
  try {
    const siteSettings = await getSiteSettings();
    mainWebsiteShowPrices = siteSettings.mainWebsiteShowPrices === true;
  } catch {}

  return all.map((p) => {
    const isPriceBlocked = !mainWebsiteShowPrices;
    return {
      ...p,
      price_on_enquiry: isPriceBlocked ? true : (p.price_on_enquiry ?? false),
      price_on_request: isPriceBlocked ? true : (p.price_on_request ?? false),
      price_display_mode: isPriceBlocked ? 'request' : (p.price_display_mode || 'show'),
    };
  });
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getAllProducts();
  return products.find(p => (p.slug === slug || p.id === slug || p.code === slug) && p.is_active) || null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getAllProducts();
  return products.find(p => p.id === id || p.code === id) || null;
}

export async function getCategories(): Promise<Category[]> {
  let list: Category[] = [];

  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseDb();
      if (db) {
        const snap = await getDocs(collection(db, 'categories'));
        if (!snap.empty) {
          snap.forEach((d) => list.push(d.data() as Category));
        }
      }
    } catch (err) {
      console.warn('Firebase categories fetch fallback:', err);
    }
  }

  if (list.length === 0 && isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase.from('categories').select('*').order('display_order');
      if (!error && data && data.length > 0) list = data;
    } catch {}
  }

  if (list.length === 0) {
    list = [...SEED_CATEGORIES];
  }

  // Strictly filter out any legacy categories
  const filtered = list.filter(
    (c) =>
      c &&
      !c.id?.startsWith('c1000000') &&
      !c.slug?.includes('legacy') &&
      !c.name?.toLowerCase().includes('legacy')
  );

  // Guarantee One-Piece Kurti exists
  if (!filtered.some((c) => c.id === 'cat-1p-kurtis' || c.slug === 'one-piece-kurtis')) {
    filtered.splice(2, 0, {
      id: 'cat-1p-kurtis',
      name: 'One-Piece Kurtis (1P)',
      slug: 'one-piece-kurtis',
      description: 'Designer straight, A-line and flared one-piece kurtis and daily tunics',
      display_order: 3,
    });
  }

  return filtered.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
}

import { getAllCollections, getCollectionBySlug as getColBySlug } from './collections';

export async function getCollections(): Promise<Collection[]> {
  return getAllCollections();
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  return getColBySlug(slug);
}

export async function saveProduct(productData: Partial<Product>): Promise<Product> {
  const persisted = loadPersistedProducts();

  const deletedIds = loadDeletedProductIds();
  let deletedModified = false;

  if (productData.id && deletedIds.has(productData.id)) {
    deletedIds.delete(productData.id);
    inMemoryDeletedProductIds.delete(productData.id);
    deletedModified = true;
  }
  if (productData.code && deletedIds.has(productData.code)) {
    deletedIds.delete(productData.code);
    inMemoryDeletedProductIds.delete(productData.code);
    deletedModified = true;
  }
  if (deletedModified) {
    saveDeletedProductIds(deletedIds);
  }

  if (productData.id) {

    // Update if already persisted
    const pIdx = persisted.findIndex(p => p.id === productData.id || p.code === productData.id);
    if (pIdx !== -1) {
      persisted[pIdx] = {
        ...persisted[pIdx],
        ...productData,
        updated_at: new Date().toISOString(),
      } as Product;
      savePersistedProducts(persisted);
      inMemoryProducts = inMemoryProducts.map(p => p.id === productData.id ? persisted[pIdx] : p);

      if (isFirebaseConfigured()) {
        try {
          const db = getFirebaseDb();
          if (db) {
            const payload = sanitizeForFirestore(persisted[pIdx]);
            await setDoc(doc(db, 'products', persisted[pIdx].id), payload, { merge: true });
          }
        } catch (err) {
          console.error('Failed to sync product update to Firebase:', err);
        }
      }

      return persisted[pIdx];
    }

    // Existing seed or in-memory product edited
    const existing = [...SEED_PRODUCTS, ...inMemoryProducts].find(p => p.id === productData.id || p.code === productData.id);
    const updatedProduct: Product = {
      ...(existing || {}),
      ...productData,
      id: productData.id,
      updated_at: new Date().toISOString(),
    } as Product;

    persisted.unshift(updatedProduct);
    savePersistedProducts(persisted);
    inMemoryProducts = inMemoryProducts.map(p => p.id === productData.id ? updatedProduct : p);
    if (!inMemoryProducts.some(p => p.id === productData.id)) {
      inMemoryProducts.unshift(updatedProduct);
    }

    if (isFirebaseConfigured()) {
      try {
        const db = getFirebaseDb();
        if (db) {
          const payload = sanitizeForFirestore(updatedProduct);
          await setDoc(doc(db, 'products', updatedProduct.id), payload, { merge: true });
        }
      } catch (err) {
        console.error('Failed to sync product update to Firebase:', err);
      }
    }

    return updatedProduct;
  }

  // Create new
  const newProduct: Product = {
    id: productData.id || `p-${Date.now()}`,
    code: productData.code || `BF-K-${Math.floor(100 + Math.random() * 900)}`,
    title: productData.title || 'Untitled Kurti Design',
    slug: productData.slug || (productData.title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
    description: productData.description || '',
    category_id: productData.category_id || 'cat-3p-kurtis',
    category: inMemoryCategories.find(c => c.id === productData.category_id) || inMemoryCategories[0],
    fabric: productData.fabric || '',
    color: productData.color || '',
    style_type: productData.style_type || '',
    base_wholesale_price: productData.base_wholesale_price !== undefined && productData.base_wholesale_price !== null && !isNaN(Number(productData.base_wholesale_price)) ? Number(productData.base_wholesale_price) : 0,
    currency: 'INR',
    moq: productData.moq !== undefined && productData.moq !== null && !isNaN(Number(productData.moq)) ? Number(productData.moq) : 0,
    price_on_enquiry: productData.price_on_enquiry ?? true,
    price_on_request: productData.price_on_enquiry ?? true,
    price_display_mode: (productData.price_on_enquiry ?? true) ? 'request' : (productData.price_display_mode || 'request'),
    stock_status: productData.stock_status || 'in_stock',
    is_active: productData.is_active ?? true,
    is_featured: productData.is_featured ?? false,
    images: Array.isArray(productData.images) ? productData.images : [],
    variants: productData.variants?.length ? productData.variants : [
      { id: `v-m-${Date.now()}`, size: 'M', stock_quantity: 50, is_available: true },
      { id: `v-l-${Date.now()}`, size: 'L', stock_quantity: 50, is_available: true },
      { id: `v-xl-${Date.now()}`, size: 'XL', stock_quantity: 50, is_available: true },
      { id: `v-xxl-${Date.now()}`, size: 'XXL', stock_quantity: 30, is_available: true },
    ],
    collections: productData.collections || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (deletedIds.has(newProduct.id)) {
    deletedIds.delete(newProduct.id);
    inMemoryDeletedProductIds.delete(newProduct.id);
    saveDeletedProductIds(deletedIds);
  }
  if (newProduct.code && deletedIds.has(newProduct.code)) {
    deletedIds.delete(newProduct.code);
    inMemoryDeletedProductIds.delete(newProduct.code);
    saveDeletedProductIds(deletedIds);
  }

  persisted.unshift(newProduct);
  savePersistedProducts(persisted);
  inMemoryProducts.unshift(newProduct);

  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseDb();
      if (db) {
        const payload = sanitizeForFirestore(newProduct);
        await setDoc(doc(db, 'products', newProduct.id), payload, { merge: true });
      }
    } catch (err) {
      console.error('Failed to sync new product to Firebase:', err);
    }
  }

  return newProduct;
}

export async function deleteProducts(ids: string[]): Promise<{ success: boolean; deletedCount: number }> {
  const validIds = ids.map((s) => String(s || '').trim()).filter(Boolean);
  if (validIds.length === 0) {
    return { success: true, deletedCount: 0 };
  }

  const deletedIds = loadDeletedProductIds();
  const allCurrent = [...loadPersistedProducts(), ...inMemoryProducts, ...SEED_PRODUCTS];

  for (const id of validIds) {
    deletedIds.add(id);
    inMemoryDeletedProductIds.add(id);

    // Also register id and code for any matching products
    const matches = allCurrent.filter((p) => p.id === id || p.code === id);
    for (const m of matches) {
      if (m.id) {
        deletedIds.add(m.id);
        inMemoryDeletedProductIds.add(m.id);
      }
      if (m.code) {
        deletedIds.add(m.code);
        inMemoryDeletedProductIds.add(m.code);
      }
    }
  }

  saveDeletedProductIds(deletedIds);

  // Update persisted custom products
  const persisted = loadPersistedProducts();
  const nextPersisted = persisted.filter(
    (p) => !deletedIds.has(p.id) && !deletedIds.has(p.code)
  );
  savePersistedProducts(nextPersisted);

  // Update in-memory products
  inMemoryProducts = inMemoryProducts.filter(
    (p) => !deletedIds.has(p.id) && !deletedIds.has(p.code)
  );

  // Sync deletion to Firestore
  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseDb();
      if (db) {
        // 1. Save all deleted IDs to Firestore system metadata so no serverless instance resurrects them
        try {
          const metaRef = doc(db, 'system_metadata', 'deleted_products');
          await setDoc(
            metaRef,
            {
              ids: Array.from(deletedIds),
              updated_at: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (err) {
          console.error('Failed to update system_metadata/deleted_products in Firestore:', err);
        }

        // 2. Delete matching documents from 'products' collection
        for (const id of validIds) {
          try {
            await deleteDoc(doc(db, 'products', id));
          } catch {}

          // Also delete by id and code queries
          try {
            const qId = query(collection(db, 'products'), where('id', '==', id));
            const snapId = await getDocs(qId);
            for (const d of snapId.docs) {
              await deleteDoc(d.ref);
            }
          } catch {}

          try {
            const qCode = query(collection(db, 'products'), where('code', '==', id));
            const snapCode = await getDocs(qCode);
            for (const d of snapCode.docs) {
              await deleteDoc(d.ref);
            }
          } catch {}
        }
      }
    } catch (err) {
      console.error('Failed to sync product deletion to Firebase:', err);
    }
  }

  return { success: true, deletedCount: validIds.length };
}

export async function deleteProduct(id: string): Promise<boolean> {
  const res = await deleteProducts([id]);
  return res.success;
}

