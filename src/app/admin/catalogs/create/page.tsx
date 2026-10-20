import React from 'react';
import { getAllProducts, getCategories, getCollections } from '@/lib/repository/products';
import { getAllCustomers, getCatalogById, getAllCatalogs } from '@/lib/repository/catalogs';
import { UniversalCatalogBuilder } from '@/components/admin/UniversalCatalogBuilder';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Catalog Builder & Editor | Bhavya Fashions Wholesale',
};

interface CreateCatalogPageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function CreateCatalogPage({ searchParams }: CreateCatalogPageProps) {
  const { id } = await searchParams;

  const [products, categories, collections, customers, initialCatalog, allCatalogs] = await Promise.all([
    getAllProducts(),
    getCategories(),
    getCollections(),
    getAllCustomers(),
    id ? getCatalogById(id) : Promise.resolve(null),
    getAllCatalogs(),
  ]);

  return (
    <UniversalCatalogBuilder
      products={products}
      categories={categories}
      collections={collections}
      customers={customers}
      initialCatalog={initialCatalog}
      existingCatalogs={allCatalogs}
    />
  );
}
