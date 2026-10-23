import { describe, it, expect } from 'vitest';
import { getAllCatalogs, recordCatalogShare, saveCustomer } from '../src/lib/repository/catalogs';
import { getAllCollections, saveCollection, deleteCollection } from '../src/lib/repository/collections';
import { getAllBlogs, getBlogBySlug, saveBlog } from '../src/lib/repository/blogs';

describe('Admin Collections & Catalog Links & Blogs Management', () => {
  it('should save and retrieve custom collections', async () => {
    const newCol = await saveCollection({
      name: 'Festive Test Collection 2026',
      slug: 'festive-test-2026',
      description: 'Handcrafted Kurti sets for festive season',
      image_url: '/images/cat-3piece.jpg',
      is_featured: true,
    });

    expect(newCol).toBeDefined();
    expect(newCol.id).toBeDefined();
    expect(newCol.name).toBe('Festive Test Collection 2026');

    const all = await getAllCollections();
    expect(all.some(c => c.slug === 'festive-test-2026')).toBe(true);

    // Clean up to prevent polluting live site
    await deleteCollection(newCol.id);
  });

  it('should track catalog share links and maintain share count & history', async () => {
    const catalogs = await getAllCatalogs();
    expect(catalogs.length).toBeGreaterThan(0);
    const targetCatalog = catalogs[0];

    const initialShareCount = targetCatalog.share_count || 0;
    const initialHistoryLength = targetCatalog.share_history?.length || 0;

    const updated = await recordCatalogShare(targetCatalog.id, 'whatsapp', '+919830099999');
    expect(updated).not.toBeNull();
    expect(updated?.share_count).toBe(initialShareCount + 1);
    expect(updated?.share_history?.length).toBe(initialHistoryLength + 1);
    expect(updated?.share_history?.[0].channel).toBe('whatsapp');
  });

  it('should save and retrieve custom customers', async () => {
    const newCust = await saveCustomer({
      business_name: 'Jaipur Heritage Boutique',
      contact_person: 'Amit Sharma',
      phone: '+91 98290 11223',
      city: 'Jaipur',
      segment: 'Boutique',
      discount_pct: 10,
    });

    expect(newCust).toBeDefined();
    expect(newCust.business_name).toBe('Jaipur Heritage Boutique');
    expect(newCust.discount_pct).toBe(10);
  });

  it('should save, retrieve and query dynamic blog posts', async () => {
    const newBlog = await saveBlog({
      title: 'Top Wholesale Kurti Trends For Boutiques in 2026',
      slug: 'top-wholesale-kurti-trends-2026',
      excerpt: 'Discover the fabrics, silhouettes, and margin strategies dominating retail counters this year.',
      content: '<p>Direct manufacturing insights from Kolkata textile hub.</p>',
      category: 'Market Trends',
      author: 'Bhavya Design Studio',
      date: '2026-10-20',
      image_url: '/images/cat-3piece.jpg',
    });

    expect(newBlog).toBeDefined();
    expect(newBlog.slug).toBe('top-wholesale-kurti-trends-2026');

    const retrieved = await getBlogBySlug('top-wholesale-kurti-trends-2026');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.title).toBe('Top Wholesale Kurti Trends For Boutiques in 2026');
  });
});
