'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { formatINR } from '@/lib/utils';
import { Eye, Layers, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  displayPrice?: number;
  showMoq?: boolean;
  showSizes?: boolean;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({
  product,
  displayPrice,
  showMoq = true,
  showSizes = true,
  onQuickView,
}: ProductCardProps) {
  const primaryImage = product.images.find(img => img.is_primary) || product.images[0];
  const price = displayPrice ?? product.base_wholesale_price;

  return (
    <div className="group relative bg-white border border-[#E7E0D5] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
      {/* Product Image Area */}
      <div className="relative aspect-[3/4] w-full bg-[#EFE9E0] overflow-hidden">
        {primaryImage?.image_url ? (
          <img
            src={primaryImage.image_url}
            alt={product.title}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#A8A29E] text-xs">
            No Image Available
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          <span className="bg-[#1C1917]/90 text-white font-mono text-[10px] uppercase font-semibold px-2 py-0.5 rounded shadow-sm">
            {product.code}
          </span>
          {product.is_featured && (
            <span className="bg-[#C5A059] text-white text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Trending</span>
            </span>
          )}
        </div>

        {/* Stock / Set Status Badge */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="bg-[#FAF7F2]/95 backdrop-blur-sm text-[#722F37] border border-[#722F37]/20 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
            {product.style_type}
          </span>
        </div>

        {/* Quick View Overlay Button */}
        {onQuickView && (
          <button
            type="button"
            onClick={() => onQuickView(product)}
            className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            aria-label={`Quick view ${product.title}`}
          >
            <span className="bg-white/95 text-[#1C1917] text-xs font-semibold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 hover:bg-[#FAF7F2]">
              <Eye className="w-3.5 h-3.5 text-[#722F37]" />
              Quick View
            </span>
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-[#78716C] font-medium flex items-center gap-1">
            <span>{product.fabric}</span>
            <span>•</span>
            <span>{product.color}</span>
          </div>

          <h3 className="font-serif-luxury text-base font-semibold text-[#1C1917] mt-1 line-clamp-1 group-hover:text-[#722F37] transition-colors">
            <Link href={`/products/${product.slug}`}>
              {product.title}
            </Link>
          </h3>
        </div>

        <div className="mt-3 pt-3 border-t border-[#F3ECE2]">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#78716C] block">
                Wholesale Price
              </span>
              <div className="text-lg font-bold text-[#722F37] tracking-tight">
                {formatINR(price)}
                <span className="text-xs font-normal text-[#78716C] ml-1">/ piece</span>
              </div>
            </div>

            {showMoq && (
              <div className="text-right">
                <span className="inline-block bg-[#F3ECE2] text-[#44403C] text-[11px] font-semibold px-2 py-0.5 rounded">
                  MOQ: {product.moq} pcs
                </span>
              </div>
            )}
          </div>

          {showSizes && product.variants?.length > 0 && (
            <div className="mt-2.5 flex items-center gap-1 flex-wrap">
              <span className="text-[10px] text-[#A8A29E] mr-1">Sizes:</span>
              {product.variants.map((v) => (
                <span
                  key={v.size}
                  className="text-[10px] px-1.5 py-0.5 bg-[#FAF7F2] border border-[#E7E0D5] rounded text-[#44403C] font-mono"
                >
                  {v.size}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3">
            <Link
              href={`/products/${product.slug}`}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold tracking-wider uppercase rounded bg-[#FAF7F2] text-[#1C1917] border border-[#E7E0D5] hover:bg-[#722F37] hover:text-white hover:border-[#722F37] transition-all"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>View Wholesale Spec</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
