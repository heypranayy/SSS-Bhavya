import React from 'react';
import { getAllCollections } from '@/lib/repository/collections';
import { getAllProducts } from '@/lib/repository/products';
import { AdminCollectionsManager } from '@/components/admin/AdminCollectionsManager';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Collections Management | Bhavya Fashions Admin',
};

export default async function AdminCollectionsPage() {
  const [collections, products] = await Promise.all([
    getAllCollections(),
    getAllProducts(),
  ]);

  return (
    <AdminCollectionsManager
      initialCollections={collections}
      products={products}
    />
  );
}
