import fs from 'fs';
import path from 'path';
import { Collection } from '@/types';
import { SEED_COLLECTIONS } from '@/lib/data/seed-data';
import { createAdminClient } from '@/lib/supabase/admin';

let inMemoryCollections: Collection[] = [...SEED_COLLECTIONS];

function getCustomCollectionsFilePath(): string {
  return path.join(process.cwd(), 'src', 'lib', 'data', 'custom-collections.json');
}

function loadPersistedCollections(): Collection[] {
  try {
    const filePath = getCustomCollectionsFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      if (data.trim()) {
        return JSON.parse(data);
      }
    }
  } catch (err) {
    console.error('Failed to read custom collections:', err);
  }
  return [];
}

function savePersistedCollections(collections: Collection[]): void {
  try {
    const filePath = getCustomCollectionsFilePath();
    fs.writeFileSync(filePath, JSON.stringify(collections, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write custom collections:', err);
  }
}

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && !url.includes('placeholder') && !url.includes('your-project-id'));
}

export async function getAllCollections(): Promise<Collection[]> {
  const persisted = loadPersistedCollections();
  const mergedMap = new Map<string, Collection>();

  for (const c of SEED_COLLECTIONS) {
    mergedMap.set(c.id, c);
  }
  for (const c of inMemoryCollections) {
    mergedMap.set(c.id, c);
  }
  for (const c of persisted) {
    mergedMap.set(c.id, c);
  }

  const all = Array.from(mergedMap.values());
  inMemoryCollections = all;

  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase.from('collections').select('*').order('display_order');
      if (!error && data && data.length > 0) return data;
    } catch {}
  }

  return [...all];
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  const collections = await getAllCollections();
  return collections.find(c => c.slug === slug) || null;
}

export async function saveCollection(collectionData: Partial<Collection>): Promise<Collection> {
  const persisted = loadPersistedCollections();

  if (collectionData.id) {
    const idx = persisted.findIndex(c => c.id === collectionData.id);
    if (idx !== -1) {
      persisted[idx] = {
        ...persisted[idx],
        ...collectionData,
      } as Collection;
      savePersistedCollections(persisted);
      await getAllCollections();
      return persisted[idx];
    }
  }

  const slug = collectionData.slug || (collectionData.name || 'collection')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const newCollection: Collection = {
    id: collectionData.id || `col-${Date.now()}`,
    name: collectionData.name || 'New Wholesale Collection',
    slug,
    description: collectionData.description || '',
    image_url: collectionData.image_url || '/images/cat-3piece.jpg',
    is_featured: collectionData.is_featured ?? true,
    display_order: collectionData.display_order ?? (persisted.length + 1),
    product_count: collectionData.product_count ?? 0,
  };

  persisted.unshift(newCollection);
  savePersistedCollections(persisted);
  inMemoryCollections.unshift(newCollection);

  return newCollection;
}

export async function deleteCollection(id: string): Promise<boolean> {
  const persisted = loadPersistedCollections();
  const next = persisted.filter(c => c.id !== id);
  savePersistedCollections(next);
  inMemoryCollections = inMemoryCollections.filter(c => c.id !== id);
  return true;
}
