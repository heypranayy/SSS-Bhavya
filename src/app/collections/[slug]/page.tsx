import React from 'react';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CollectionFilterView } from '@/components/collections/CollectionFilterView';
import { getCollectionBySlug, getAllProducts } from '@/lib/repository/products';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    return { title: 'Collection Not Found | Bhavya Fashions' };
  }

  return {
    title: `${collection.name} — Wholesale Indian Kurti Collection`,
    description: collection.description || `Browse the latest wholesale designs in our ${collection.name} catalog. Direct manufacturer wholesale prices.`,
  };
}

export default async function CollectionDetailPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const [collection, allProducts] = await Promise.all([
    getCollectionBySlug(slug),
    getAllProducts(),
  ]);

  if (!collection) {
    notFound();
  }

  // Filter products belonging to this collection with resilient alias fallback
  const cSlug = (collection.slug || '').toLowerCase();
  const cId = (collection.id || '').toLowerCase();
  const cName = (collection.name || '').toLowerCase();

  const matchingProducts = allProducts.filter((p) => {
    // 1. Direct collection match
    if (
      p.collections?.some(
        (c) =>
          c.id === collection.id ||
          c.slug?.toLowerCase() === cSlug ||
          c.name?.toLowerCase() === cName
      )
    ) {
      return true;
    }

    // 2. Fallback matching by category, style, or title keywords
    const style = (p.style_type || '').toLowerCase();
    const catSlug = (p.category?.slug || '').toLowerCase();
    const catName = (p.category?.name || '').toLowerCase();
    const catId = (p.category_id || p.category?.id || '').toLowerCase();
    const title = p.title.toLowerCase();

    if (cSlug.includes('3-piece') || cSlug.includes('three-piece') || cSlug.includes('3p')) {
      return (
        style.includes('3-piece') ||
        catSlug.includes('3-piece') ||
        catName.includes('three-piece') ||
        style.includes('dupatta') ||
        title.includes('3 piece') ||
        title.includes('3-piece') ||
        title.includes('dupatta')
      );
    }

    if (cSlug.includes('2-piece') || cSlug.includes('two-piece') || cSlug.includes('2p')) {
      return (
        style.includes('2-piece') ||
        catSlug.includes('2-piece') ||
        catName.includes('two-piece') ||
        title.includes('2 piece') ||
        title.includes('2-piece')
      );
    }

    if (cSlug.includes('coord') || cSlug.includes('co-ord')) {
      return (
        style.includes('co-ord') ||
        catSlug.includes('coord') ||
        catName.includes('co-ord') ||
        title.includes('coord') ||
        title.includes('co-ord')
      );
    }

    if (cSlug.includes('anarkali') || cSlug.includes('gown')) {
      return (
        style.includes('anarkali') ||
        catSlug.includes('gowns') ||
        catName.includes('anarkali') ||
        title.includes('anarkali') ||
        title.includes('gown')
      );
    }

    if (cSlug.includes('single') || cSlug.includes('kurti')) {
      return (
        style.includes('single') ||
        catSlug.includes('kurti') ||
        catName.includes('single') ||
        title.includes('single') ||
        title.includes('kurti')
      );
    }

    if (cSlug.includes('western') || cSlug.includes('midi')) {
      return (
        style.includes('western') ||
        catSlug.includes('western') ||
        catName.includes('western') ||
        title.includes('midi')
      );
    }

    return catSlug === cSlug || catId === cId;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />

      <main className="flex-1">
        <CollectionFilterView
          collection={collection}
          products={matchingProducts.length > 0 ? matchingProducts : allProducts}
        />
      </main>

      <Footer />
    </div>
  );
}
