import { describe, it, expect, afterAll } from 'vitest';
import { getAllCollections, saveCollection, deleteCollection } from '@/lib/repository/collections';

describe('Collections Deletion and Deletion Tracking', () => {
  let createdCollectionId: string;

  it('creates a custom collection, verifies existence, and deletes it permanently', async () => {
    const timestamp = Date.now();
    const created = await saveCollection({
      name: `Test Summer Collection ${timestamp}`,
      slug: `test-summer-${timestamp}`,
      description: 'Temporary collection for deletion test',
      is_featured: true,
    });

    createdCollectionId = created.id;
    expect(created.id).toBeDefined();

    // Verify it is in getAllCollections()
    const allBefore = await getAllCollections();
    expect(allBefore.some(c => c.id === createdCollectionId)).toBe(true);

    // Delete it
    const deleted = await deleteCollection(createdCollectionId);
    expect(deleted).toBe(true);

    // Verify it is no longer in getAllCollections()
    const allAfter = await getAllCollections();
    expect(allAfter.some(c => c.id === createdCollectionId)).toBe(false);
  });
});
