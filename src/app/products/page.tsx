import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CollectionFilterView } from '@/components/collections/CollectionFilterView';
import { getAllProducts } from '@/lib/repository/products';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'All Wholesale Indian Kurtis & Ensembles | Bhavya Fashions Catalog',
  description: 'Browse all Bhavya Fashions wholesale designs: 2-Piece Kurti Pant sets, 3-Piece Kesaria Silk Dupatta ensembles, Co-ords, and Western Midis. Filter by DN code, fabric, and price.',
};

export default async function AllProductsPage() {
  const products = await getAllProducts();

  const virtualCollection = {
    id: 'col-all-products',
    name: 'All Wholesale Designs & Collections',
    slug: 'all-products',
    description: `Complete wholesale catalog featuring ${products.length} ready-to-dispatch designs manufactured across our Kolkata Barabazar and Surat textile hubs. Minimum order 6 pieces per design.`,
    is_featured: true,
    product_count: products.length,
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />

      <main className="flex-1">
        <CollectionFilterView
          collection={virtualCollection}
          products={products}
        />
      </main>

      <Footer />
    </div>
  );
}
