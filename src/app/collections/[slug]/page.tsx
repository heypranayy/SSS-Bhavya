import React from 'react';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CollectionFilterView } from '@/components/collections/CollectionFilterView';
import { getCollectionBySlug, getAllProducts } from '@/lib/repository/products';

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

  // Filter products belonging to this collection
  const matchingProducts = allProducts.filter(p =>
    p.collections?.some(c => c.id === collection.id || c.slug === collection.slug)
  );

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
