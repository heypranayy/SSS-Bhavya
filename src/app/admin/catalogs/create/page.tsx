import React from 'react';
import { getAllProducts, getCategories, getCollections } from '@/lib/repository/products';
import { getAllCustomers } from '@/lib/repository/catalogs';
import { UniversalCatalogBuilder } from '@/components/admin/UniversalCatalogBuilder';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Create Catalog | Universal Dynamic Engine | Bhavya Fashions',
};

export default async function CreateCatalogPage() {
  const [products, categories, collections, customers] = await Promise.all([
    getAllProducts(),
    getCategories(),
    getCollections(),
    getAllCustomers(),
  ]);

  return (
    <UniversalCatalogBuilder
      products={products}
      categories={categories}
      collections={collections}
      customers={customers}
    />
  );
}
