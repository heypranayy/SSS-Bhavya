'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { formatINR, getProductFallbackImage } from '@/lib/utils';
import { Eye, Layers, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  displayPrice?: number;
  showMoq?: boolean;
  showSizes?: boolean;
  onQuickView?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  isInCart?: boolean;
}

export function ProductCard({
  product,
  displayPrice,
  showMoq = true,
  onQuickView,
  onAddToCart,
  isInCart = false,
}: ProductCardProps) {
  const fallbackSrc = getProductFallbackImage(product.style_type || product.category?.name);
  const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
  const imgSrc = (primaryImage as any)?.local_url || primaryImage?.image_url || fallbackSrc;
  const price = displayPrice ?? product.base_wholesale_price;
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919830729210';

  const directWhatsAppUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hello Bhavya Fashions, I am inquiring about wholesale design: ${product.code} - ${product.title}\n• Category: ${product.category?.name || product.style_type}\n• Cloth Type: ${product.fabric}\n• MOQ: ${product.moq || 4} pcs set (Ratio pack)\nPlease share live stock and quotation.`
  )}`;

  return (
    <div className={`group relative bg-white border rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${
      isInCart ? 'border-emerald-600 ring-2 ring-emerald-500/25' : 'border-[#E7E0D5]'
    }`}>
      {/* Product Image Area */}
      <div className="relative aspect-[3/4] w-full bg-[#EFE9E0] overflow-hidden">
        <img
          src={imgSrc}
          alt={product.title}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== fallbackSrc && !target.src.endsWith(fallbackSrc)) {
              target.src = fallbackSrc;
            }
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          <span className="bg-[#1C1917]/90 backdrop-blur-xs text-[#C5A059] font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-xs">
            {product.code}
          </span>
          {product.is_featured && (
            <span className="bg-[#C5A059] text-white text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-xs">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Hit Design</span>
            </span>
          )}
        </div>



        {/* Quick View Overlay Button */}
        {onQuickView && (
          <button
            type="button"
            onClick={() => onQuickView(product)}
            className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            aria-label={`Quick view ${product.title}`}
          >
            <span className="bg-white/95 text-[#1C1917] text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5 hover:bg-[#FAF7F2]">
              <Eye className="w-3.5 h-3.5 text-[#722F37]" />
              Quick View Specs
            </span>
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Category & Cloth Type */}
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#722F37] font-bold block">
            {product.category?.name || product.style_type}
          </span>

          <h3 className="font-serif-luxury text-base font-bold text-[#1C1917] mt-1 line-clamp-1 group-hover:text-[#722F37] transition-colors">
            <Link href={`/products/${product.slug}`} title={product.title}>
              {product.title}
            </Link>
          </h3>

          {/* Cloth Type / Materials line */}
          <div className="mt-1.5 text-xs text-[#78716C] flex items-center gap-1.5 line-clamp-1">
            <span className="text-[11px] font-semibold text-zinc-900 bg-[#FAF7F2] border border-[#E7E0D5] px-2 py-0.5 rounded">
              {product.fabric}
            </span>
            <span className="text-zinc-400">•</span>
            <span className="text-[11px] text-zinc-600">{product.color}</span>
          </div>

          {/* Packing Details */}
          <div className="mt-2 text-[11px] text-[#78716C] flex items-center justify-between">
            <span>Ratio Pack: <strong className="text-zinc-800 font-mono">M to 3XL</strong></span>
            <span className="text-emerald-700 font-semibold text-[10px]">Ready Dispatch</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[#F3ECE2]">
          {/* Style Tag (moved from image to near quote) */}
          <div className="flex items-center justify-between gap-1 mb-2">
            {product.style_type && (
              <span className="inline-flex items-center bg-[#FAF6EE] text-[#722F37] border border-[#722F37]/20 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs truncate max-w-[170px]">
                {product.style_type}
              </span>
            )}
            {showMoq && (
              <span className="inline-block bg-[#F3ECE2] text-[#44403C] text-[10px] font-semibold px-2 py-0.5 rounded shrink-0">
                MOQ: {product.moq ? `${product.moq} pcs set` : '4 pcs set'}
              </span>
            )}
          </div>

          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-[#78716C] block font-medium">
                Wholesale Price
              </span>
              {product.price_on_enquiry !== false && product.price_on_request !== false ? (
                <div className="text-sm font-bold text-[#722F37] tracking-tight">
                  Price on Enquiry
                </div>
              ) : price ? (
                <div className="text-base font-extrabold text-[#722F37] tracking-tight">
                  {formatINR(price)}
                  <span className="text-[10px] font-normal text-[#78716C] ml-1">/ pc (+GST)</span>
                </div>
              ) : (
                <div className="text-sm font-bold text-[#722F37] tracking-tight">
                  Price on Enquiry
                </div>
              )}
            </div>
          </div>

          {/* Actions: Add to WhatsApp Cart & View Specs */}
          <div className="grid grid-cols-2 gap-2">
            {onAddToCart ? (
              <button
                type="button"
                onClick={() => onAddToCart(product)}
                className={`inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs ${
                  isInCart
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#722F37] text-white hover:bg-[#58111A]'
                }`}
              >
                {isInCart ? (
                  <span>✓ In Cart</span>
                ) : (
                  <span>+ WhatsApp Cart</span>
                )}
              </button>
            ) : (
              <a
                href={directWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl bg-[#25D366] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-[#20ba59] transition-all shadow-xs"
              >
                <span>WhatsApp Quote</span>
              </a>
            )}

            <Link
              href={`/products/${product.slug}`}
              className="inline-flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-[#FAF7F2] text-[#1C1917] border border-[#E7E0D5] hover:bg-[#FAF7F2] hover:border-[#722F37] text-[11px] font-semibold uppercase tracking-wider transition-all"
            >
              <Layers className="w-3 h-3 text-[#722F37]" />
              <span>Specs</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
