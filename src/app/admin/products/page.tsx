import React from 'react';
import { getAllProducts, getCategories } from '@/lib/repository/products';
import { ProductsManager } from '@/components/admin/ProductsManager';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Products Management | Bhavya Fashions Admin',
};

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getCategories(),
  ]);

  return <ProductsManager initialProducts={products} categories={categories} />;
}
