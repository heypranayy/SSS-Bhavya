import React from 'react';
import { getCategories, getCollections } from '@/lib/repository/products';
import { ProductEditor } from '@/components/admin/ProductEditor';

export const metadata = {
  title: 'Add New Wholesale Product | Bhavya Fashions Admin',
};

export default async function NewProductPage() {
  const [categories, collections] = await Promise.all([
    getCategories(),
    getCollections(),
  ]);

  return (
    <ProductEditor
      categories={categories}
      collections={collections}
    />
  );
}
