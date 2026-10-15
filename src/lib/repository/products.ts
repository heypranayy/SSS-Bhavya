import { Product, Category, Collection } from '@/types';
import { SEED_CATEGORIES, SEED_COLLECTIONS, SEED_PRODUCTS } from '@/lib/data/seed-data';
import { createAdminClient } from '@/lib/supabase/admin';

// In-memory product cache for seamless offline / zero-setup mode
let inMemoryProducts: Product[] = [...SEED_PRODUCTS];
let inMemoryCollections: Collection[] = [...SEED_COLLECTIONS];
let inMemoryCategories: Category[] = [...SEED_CATEGORIES];

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && !url.includes('placeholder') && !url.includes('your-project-id'));
}

export async function getAllProducts(): Promise<Product[]> {
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
        return data.map((p: any) => ({
          ...p,
          images: p.images || [],
          variants: p.variants || [],
          collections: p.collections?.map((c: any) => c.collection) || [],
        }));
      }
    } catch {
      // Fallback to in-memory on error
    }
  }

  return [...inMemoryProducts];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getAllProducts();
  return products.find(p => p.slug === slug && p.is_active) || null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getAllProducts();
  return products.find(p => p.id === id) || null;
}

export async function getCategories(): Promise<Category[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase.from('categories').select('*').order('display_order');
      if (!error && data && data.length > 0) return data;
    } catch {}
  }
  return [...inMemoryCategories];
}

export async function getCollections(): Promise<Collection[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase.from('collections').select('*').order('display_order');
      if (!error && data && data.length > 0) return data;
    } catch {}
  }
  return [...inMemoryCollections];
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  const collections = await getCollections();
  return collections.find(c => c.slug === slug) || null;
}

export async function saveProduct(productData: Partial<Product>): Promise<Product> {
  if (productData.id) {
    // Update
    const index = inMemoryProducts.findIndex(p => p.id === productData.id);
    if (index !== -1) {
      inMemoryProducts[index] = {
        ...inMemoryProducts[index],
        ...productData,
        updated_at: new Date().toISOString(),
      } as Product;
      return inMemoryProducts[index];
    }
  }

  // Create new
  const newProduct: Product = {
    id: productData.id || `p-${Date.now()}`,
    code: productData.code || `BF-K-${Math.floor(100 + Math.random() * 900)}`,
    title: productData.title || 'Untitled Kurti Design',
    slug: productData.slug || (productData.title || 'untitled').toLowerCase().replace(/\s+/g, '-'),
    description: productData.description || '',
    category_id: productData.category_id,
    category: inMemoryCategories.find(c => c.id === productData.category_id),
    fabric: productData.fabric || 'Pure Cotton 60-60',
    color: productData.color || 'Standard',
    style_type: productData.style_type || 'Straight Kurti',
    base_wholesale_price: Number(productData.base_wholesale_price) || 499,
    currency: 'INR',
    moq: Number(productData.moq) || 6,
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

  inMemoryProducts.unshift(newProduct);
  return newProduct;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const initialLength = inMemoryProducts.length;
  inMemoryProducts = inMemoryProducts.filter(p => p.id !== id);
  return inMemoryProducts.length < initialLength;
}
