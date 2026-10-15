import React from 'react';
import { notFound } from 'next/navigation';
import { getProductById, getCategories, getCollections } from '@/lib/repository/products';
import { ProductEditor } from '@/components/admin/ProductEditor';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Edit Product | Bhavya Fashions Admin',
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [product, categories, collections] = await Promise.all([
    getProductById(id),
    getCategories(),
    getCollections(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <ProductEditor
      initialProduct={product}
      categories={categories}
      collections={collections}
    />
  );
}
