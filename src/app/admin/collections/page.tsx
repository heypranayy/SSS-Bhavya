import React from 'react';
import Link from 'next/link';
import { getCollections, getAllProducts } from '@/lib/repository/products';
import { FolderTree, Sparkles, PlusCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Collections Management | Bhavya Fashions Admin',
};

export default async function AdminCollectionsPage() {
  const [collections, products] = await Promise.all([
    getCollections(),
    getAllProducts(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#722F37] font-bold">
            Catalog Series
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1C1917]">
            Collections Management ({collections.length})
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((col) => {
          const count = products.filter(p =>
            p.collections?.some(c => c.id === col.id || c.slug === col.slug)
          ).length;

          return (
            <div
              key={col.id}
              className="bg-white rounded-2xl border border-[#E7E0D5] overflow-hidden shadow-xs flex flex-col"
            >
              <div className="relative aspect-[16/9] bg-[#EFE9E0]">
                {col.image_url && (
                  <img src={col.image_url} alt="" className="w-full h-full object-cover" />
                )}
                {col.is_featured && (
                  <span className="absolute top-2 right-2 bg-[#C5A059] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                    Featured
                  </span>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-serif-luxury text-base font-bold text-[#1C1917]">
                    {col.name}
                  </h3>
                  <p className="text-xs text-[#78716C] mt-1 line-clamp-2">
                    {col.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#F3ECE2] flex items-center justify-between text-xs">
                  <span className="text-[#78716C]">Assigned Products:</span>
                  <span className="font-bold text-[#722F37]">{count || col.product_count || 4} Designs</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
