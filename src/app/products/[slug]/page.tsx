import React from 'react';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductDetailView } from '@/components/products/ProductDetailView';
import { getProductBySlug, getAllProducts } from '@/lib/repository/products';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: 'Product Not Found | Bhavya Fashions' };
  }

  return {
    title: `${product.code} — ${product.title} | Wholesale Kurtis`,
    description: `${product.title} (${product.code}). ${product.fabric} ${product.style_type}. Wholesale price ₹${product.base_wholesale_price}/pc, MOQ ${product.moq} pcs. Direct wholesale supplier Bhavya Fashions.`,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, allProducts] = await Promise.all([
    getProductBySlug(slug),
    getAllProducts(),
  ]);

  if (!product) {
    notFound();
  }

  const related = allProducts
    .filter(p => p.id !== product.id && (p.category_id === product.category_id || p.style_type === product.style_type))
    .slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />

      <main className="flex-1">
        <ProductDetailView product={product} relatedProducts={related} />
      </main>

      <Footer />
    </div>
  );
}
