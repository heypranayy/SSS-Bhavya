import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { getCollections, getCategories } from '@/lib/repository/products';
import { ArrowRight, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Wholesale Kurti Collections | Bhavya Fashions',
  description: 'Browse our complete range of wholesale Indian ethnic wear collections: pure muslin 3-piece sets, cotton 2-piece sets, Alia & Nayra cuts, and festive Chanderi suits.',
};

export default async function CollectionsPage() {
  const [collections, categories] = await Promise.all([
    getCollections(),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />

      <main className="flex-1 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-[#722F37] font-semibold">
              Wholesale Catalogs
            </span>
            <h1 className="font-serif-luxury text-4xl sm:text-5xl font-bold text-[#1C1917]">
              B2B Kurti Collections 2026
            </h1>
            <p className="text-sm sm:text-base text-[#57534E] leading-relaxed">
              Curated wholesale series tailored for boutique proprietors, apparel resellers, and garment showrooms. Each collection is manufactured with verified colorfast fabrics and standard ratio sizing.
            </p>
          </div>

          {/* Quick Categories Bar */}
          <div className="flex items-center justify-center gap-2 flex-wrap mb-12">
            <span className="text-xs font-semibold text-[#78716C] uppercase tracking-wider mr-2">
              Browse Categories:
            </span>
            {categories.map((cat) => (
              <span
                key={cat.id}
                className="text-xs bg-white border border-[#E7E0D5] px-3.5 py-1.5 rounded-full text-[#44403C] font-medium shadow-2xs"
              >
                {cat.name}
              </span>
            ))}
          </div>

          {/* Collections Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {collections.map((col) => (
              <Link
                key={col.id}
                href={`/collections/${col.slug}`}
                className="group bg-white rounded-2xl overflow-hidden border border-[#E7E0D5] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="relative aspect-[4/3] bg-[#EFE9E0] overflow-hidden">
                  {col.image_url && (
                    <img
                      src={col.image_url}
                      alt={col.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  <span className="absolute top-3 left-3 bg-white/95 text-[#722F37] text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded shadow-sm">
                    {col.product_count || 5}+ Designs
                  </span>

                  {col.is_featured && (
                    <span className="absolute top-3 right-3 bg-[#C5A059] text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Featured Series</span>
                    </span>
                  )}
                </div>

                <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                  <div>
                    <h3 className="font-serif-luxury text-xl font-bold text-[#1C1917] group-hover:text-[#722F37] transition-colors">
                      {col.name}
                    </h3>
                    <p className="text-xs text-[#78716C] mt-2 leading-relaxed">
                      {col.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#F3ECE2] flex items-center justify-between text-xs font-bold text-[#722F37] uppercase tracking-wider">
                    <span>Explore Wholesale Designs</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
