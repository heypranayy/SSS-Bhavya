import { Product, Category, Collection } from '@/types';
import { SEED_CATEGORIES } from '@/lib/data/seed-data';
import { getDb, getDoc, listDocs, putDoc } from '@/lib/db';
import { productColumns } from '@/lib/db/rows';
import { getSiteSettings } from './settings';

function isHidden(p: { is_deleted?: boolean; is_active?: boolean } | null | undefined): boolean {
  return !p || (p as { is_deleted?: boolean }).is_deleted === true || p.is_active === false;
}

export async function getAllProducts(): Promise<Product[]> {
  const rows = await listDocs<Product>('products', 'created_at DESC');
  const all = rows.filter((p) => !isHidden(p));

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
  let list = await listDocs<Category>('categories', 'display_order ASC');

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

async function findStoredProduct(idOrCode: string): Promise<Product | null> {
  const byId = await getDoc<Product>('products', idOrCode);
  if (byId) return byId;
  const row = await getDb()
    .prepare('SELECT data FROM products WHERE code = ? LIMIT 1')
    .bind(idOrCode)
    .first<{ data: string }>();
  return row ? (JSON.parse(row.data) as Product) : null;
}

export async function saveProduct(productData: Partial<Product>): Promise<Product> {
  if (productData.id) {
    const existing = await findStoredProduct(productData.id);
    if (existing) {
      const updatedProduct: Product = {
        ...existing,
        ...productData,
        id: existing.id,
        updated_at: new Date().toISOString(),
      } as Product;
      await putDoc('products', updatedProduct.id, productColumns(updatedProduct), updatedProduct);
      return updatedProduct;
    }
  }

  // Create new
  const categories = await getCategories();
  const now = new Date().toISOString();
  const newProduct: Product = {
    id: productData.id || `p-${Date.now()}`,
    code: productData.code || `BF-K-${Math.floor(100 + Math.random() * 900)}`,
    title: productData.title || 'Untitled Kurti Design',
    slug: productData.slug || (productData.title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
    description: productData.description || '',
    category_id: productData.category_id || 'cat-3p-kurtis',
    category: categories.find(c => c.id === productData.category_id) || categories[0],
    fabric: productData.fabric || '',
    color: productData.color || '',
    style_type: productData.style_type || '',
    base_wholesale_price: productData.base_wholesale_price !== undefined && productData.base_wholesale_price !== null && !isNaN(Number(productData.base_wholesale_price)) ? Number(productData.base_wholesale_price) : 0,
    currency: 'INR',
    moq: productData.moq !== undefined && productData.moq !== null && !isNaN(Number(productData.moq)) ? Number(productData.moq) : 4,
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
    created_at: now,
    updated_at: now,
  };

  await putDoc('products', newProduct.id, productColumns(newProduct), newProduct);
  return newProduct;
}

/** Permanently deletes products matching any of the given ids or product codes. */
export async function deleteProducts(ids: string[]): Promise<{ success: boolean; deletedCount: number }> {
  const validIds = ids.map((s) => String(s || '').trim()).filter(Boolean);
  if (validIds.length === 0) {
    return { success: true, deletedCount: 0 };
  }

  const placeholders = validIds.map(() => '?').join(', ');
  await getDb()
    .prepare(`DELETE FROM products WHERE id IN (${placeholders}) OR code IN (${placeholders})`)
    .bind(...validIds, ...validIds)
    .run();

  return { success: true, deletedCount: validIds.length };
}

export async function deleteProduct(id: string): Promise<boolean> {
  const res = await deleteProducts([id]);
  return res.success;
}
