import fs from 'fs';
import path from 'path';
import { Product, Category, Collection } from '@/types';
import { SEED_CATEGORIES, SEED_COLLECTIONS, SEED_PRODUCTS } from '@/lib/data/seed-data';
import { createAdminClient } from '@/lib/supabase/admin';
import { getFirebaseDb, isFirebaseConfigured, sanitizeForFirestore } from '@/lib/firebase/config';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

// In-memory product cache for seamless offline / zero-setup mode
let inMemoryProducts: Product[] = [...SEED_PRODUCTS];
let inMemoryCollections: Collection[] = [...SEED_COLLECTIONS];
let inMemoryCategories: Category[] = [...SEED_CATEGORIES];

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
  try {
    const filePath = getDeletedProductsFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      if (data.trim()) {
        const arr = JSON.parse(data);
        if (Array.isArray(arr)) return new Set(arr);
      }
    }
  } catch {}
  return new Set();
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
  const persisted = loadPersistedProducts();
  const mergedMap = new Map<string, Product>();

  // 1. Seed products
  for (const p of SEED_PRODUCTS) {
    if (!deletedIds.has(p.id) && !deletedIds.has(p.code)) {
      mergedMap.set(p.id, p);
    }
  }

  // 2. In-memory products
  for (const p of inMemoryProducts) {
    if (!deletedIds.has(p.id) && !deletedIds.has(p.code)) {
      mergedMap.set(p.id, p);
    }
  }

  // 3. Persisted custom products
  for (const p of persisted) {
    if (!deletedIds.has(p.id) && !deletedIds.has(p.code)) {
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
            const data = docSnap.data() as Product;
            if (data && data.id && data.is_active !== false && !deletedIds.has(data.id) && !deletedIds.has(data.code)) {
              mergedMap.set(data.id, {
                ...data,
                price_on_enquiry: data.price_on_enquiry ?? true,
                price_on_request: data.price_on_enquiry ?? true,
                price_display_mode: (data.price_on_enquiry ?? true) ? 'request' : (data.price_display_mode || 'request'),
              });
            }
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
          if (!deletedIds.has(p.id) && !deletedIds.has(p.code)) {
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

  const all = Array.from(mergedMap.values());
  inMemoryProducts = all;

  return all.map((p) => ({
    ...p,
    price_on_enquiry: p.price_on_enquiry ?? true,
    price_on_request: p.price_on_enquiry ?? true,
    price_display_mode: (p.price_on_enquiry ?? true) ? 'request' : (p.price_display_mode || 'request'),
  }));
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
  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseDb();
      if (db) {
        const snap = await getDocs(collection(db, 'categories'));
        if (!snap.empty) {
          const list: Category[] = [];
          snap.forEach((d) => list.push(d.data() as Category));
          if (list.length > 0) {
            return list.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
          }
        }
      }
    } catch (err) {
      console.warn('Firebase categories fetch fallback:', err);
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase.from('categories').select('*').order('display_order');
      if (!error && data && data.length > 0) return data;
    } catch {}
  }
  return [...inMemoryCategories];
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

  if (productData.id) {
    const deletedIds = loadDeletedProductIds();
    if (deletedIds.has(productData.id)) {
      deletedIds.delete(productData.id);
      if (productData.code) deletedIds.delete(productData.code);
      saveDeletedProductIds(deletedIds);
    }

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
    fabric: productData.fabric || 'Pure Cotton 60-60',
    color: productData.color || 'Standard',
    style_type: productData.style_type || 'Straight Kurti',
    base_wholesale_price: productData.base_wholesale_price !== undefined && productData.base_wholesale_price !== null && !isNaN(Number(productData.base_wholesale_price)) ? Number(productData.base_wholesale_price) : 0,
    currency: 'INR',
    moq: productData.moq !== undefined && productData.moq !== null && !isNaN(Number(productData.moq)) ? Number(productData.moq) : 0,
    price_on_enquiry: productData.price_on_enquiry ?? true,
    price_on_request: productData.price_on_enquiry ?? true,
    price_display_mode: (productData.price_on_enquiry ?? true) ? 'request' : (productData.price_display_mode || 'request'),
    stock_status: productData.stock_status || 'in_stock',
    is_active: productData.is_active ?? true,
    is_featured: productData.is_featured ?? false,
    images: productData.images?.length ? productData.images : [
      { id: `img-${Date.now()}`, image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85', display_order: 0, is_primary: true }
    ],
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

export async function deleteProduct(id: string): Promise<boolean> {
  const deletedIds = loadDeletedProductIds();
  deletedIds.add(id);

  const all = [...loadPersistedProducts(), ...inMemoryProducts, ...SEED_PRODUCTS];
  const target = all.find(p => p.id === id || p.code === id);
  if (target) {
    deletedIds.add(target.id);
    if (target.code) deletedIds.add(target.code);
  }
  saveDeletedProductIds(deletedIds);

  const persisted = loadPersistedProducts();
  const next = persisted.filter(p => p.id !== id && p.code !== id);
  savePersistedProducts(next);
  inMemoryProducts = inMemoryProducts.filter(p => p.id !== id && p.code !== id);

  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseDb();
      if (db) {
        await deleteDoc(doc(db, 'products', id));
        if (target && target.id !== id) {
          await deleteDoc(doc(db, 'products', target.id));
        }
      }
    } catch (err) {
      console.error('Failed to delete product from Firebase:', err);
    }
  }

  return true;
}
