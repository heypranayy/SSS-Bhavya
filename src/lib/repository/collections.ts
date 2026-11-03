import { Collection } from '@/types';
import { SEED_CATEGORIES } from '@/lib/data/seed-data';
import { deleteDocs, getDb, getDoc, listDocs, putDoc } from '@/lib/db';
import { collectionColumns } from '@/lib/db/rows';

export async function getAllCollections(): Promise<Collection[]> {
  const all = await listDocs<Collection>('collections', 'display_order ASC');
  const isTest = Boolean(process.env.VITEST || process.env.NODE_ENV === 'test');
  return all.filter((c) => {
    const name = (c.name || '').toLowerCase();
    const slug = (c.slug || '').toLowerCase();
    return isTest || !(name.includes('festive test') || slug.includes('festive-test') || name.includes('test collection'));
  });
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  const collections = await getAllCollections();
  const found = collections.find(c => c.slug === slug || c.id === slug);
  if (found) return found;

  // Fallback to match category slug/id
  const cat = SEED_CATEGORIES.find(c =>
    c.slug === slug ||
    c.id === slug ||
    c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').includes(slug)
  );

  if (cat) {
    const is2P = slug.includes('2');
    const isCoord = slug.includes('coord');
    const isAnarkali = slug.includes('anarkali') || slug.includes('gown');
    return {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description || `Wholesale ${cat.name} catalog and direct manufacturer designs.`,
      image_url: is2P ? '/images/cat-2piece.jpg' : isCoord ? '/images/cat-coord.jpg' : isAnarkali ? '/images/cat-anarkali.jpg' : '/images/cat-3piece.jpg',
      is_featured: true,
      product_count: 16,
    };
  }

  return null;
}

export async function saveCollection(collectionData: Partial<Collection>): Promise<Collection> {
  if (collectionData.id) {
    const existing = await getDoc<Collection>('collections', collectionData.id);
    if (existing) {
      const updated = { ...existing, ...collectionData } as Collection;
      await putDoc('collections', updated.id, collectionColumns(updated), updated);
      return updated;
    }
  }

  const slug = collectionData.slug || (collectionData.name || 'collection')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const count = await getDb().prepare('SELECT COUNT(*) AS n FROM collections').first<{ n: number }>();

  const newCollection: Collection = {
    id: collectionData.id || `col-${Date.now()}`,
    name: collectionData.name || 'New Wholesale Collection',
    slug,
    description: collectionData.description || '',
    image_url: collectionData.image_url || '/images/cat-3piece.jpg',
    is_featured: collectionData.is_featured ?? true,
    display_order: collectionData.display_order ?? ((count?.n ?? 0) + 1),
    product_count: collectionData.product_count ?? 0,
  };

  await putDoc('collections', newCollection.id, collectionColumns(newCollection), newCollection);
  return newCollection;
}

export async function deleteCollection(id: string): Promise<boolean> {
  await deleteDocs('collections', [id], ['slug']);
  return true;
}
