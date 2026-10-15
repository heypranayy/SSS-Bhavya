'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { formatINR } from '@/lib/utils';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { ProductCard } from '@/components/ui/ProductCard';
import {
  PhoneCall,
  ShieldCheck,
  Package,
  Layers,
  Sparkles,
  ChevronRight,
  ZoomIn,
  Truck,
  CheckCircle2,
} from 'lucide-react';

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const images = product.images.length > 0 ? product.images : [
    { id: 'default', image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85', display_order: 0, is_primary: true }
  ];

  const currentImage = images[selectedImageIndex] || images[0];
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919830122334';

  const whatsappMessage = encodeURIComponent(
    `Hello Bhavya Fashions, I am interested in wholesale design ${product.code} (${product.title}) priced at ₹${product.base_wholesale_price}/pc (MOQ ${product.moq} pcs). Please share available color options and ratio packing details.`
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#78716C] mb-6">
        <Link href="/" className="hover:text-[#722F37]">Home</Link>
        <ChevronRight className="w-3 h-3 text-[#A8A29E]" />
        <Link href="/collections" className="hover:text-[#722F37]">Catalog</Link>
        <ChevronRight className="w-3 h-3 text-[#A8A29E]" />
        <span className="text-[#1C1917] font-semibold">{product.code}</span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left: Gallery & Zoomable Images */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails list */}
          {images.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible shrink-0 pb-2 sm:pb-0">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIndex === idx ? 'border-[#722F37] ring-1 ring-[#722F37]' : 'border-[#E7E0D5] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover object-top" />
                </button>
              ))}
            </div>
          )}

          {/* Main Large Stage */}
          <div
            className="relative flex-1 aspect-[3/4] bg-[#EFE9E0] rounded-2xl overflow-hidden border border-[#E7E0D5] cursor-zoom-in group shadow-sm"
            onClick={() => setLightboxOpen(true)}
          >
            <img
              src={currentImage.image_url}
              alt={product.title}
              className="w-full h-full object-cover object-top group-hover:scale-102 transition-transform duration-300"
            />
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-[#1C1917] text-xs font-semibold px-2.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
              <ZoomIn className="w-3.5 h-3.5 text-[#722F37]" />
              <span>Full Screen Zoom</span>
            </div>
            <div className="absolute top-3 left-3 bg-[#1C1917]/90 text-white font-mono text-xs font-bold px-2.5 py-1 rounded">
              {product.code}
            </div>
          </div>
        </div>

        {/* Right: Specifications & Wholesale Inquiries */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-[#722F37] font-bold font-mono">
                {product.code}
              </span>
              <span className="text-[#D6CEBE]">•</span>
              <span className="text-xs font-semibold text-[#78716C] uppercase tracking-wider">
                {product.style_type}
              </span>
            </div>

            <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1C1917] mt-1.5">
              {product.title}
            </h1>
          </div>

          {/* Wholesale Pricing Box */}
          <div className="bg-white border border-[#E7E0D5] rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-[#78716C] uppercase tracking-wider block font-medium">
                  Wholesale Trade Price
                </span>
                <div className="text-3xl font-bold text-[#722F37] tracking-tight">
                  {formatINR(product.base_wholesale_price)}
                  <span className="text-xs font-normal text-[#78716C] ml-1.5">/ piece (+ GST)</span>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block bg-[#F3ECE2] text-[#1C1917] font-bold text-xs px-3 py-1 rounded-full border border-[#E7E0D5]">
                  MOQ: {product.moq} Pieces (Set)
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#78716C] pt-1 border-t border-[#F3ECE2]">
              * Standard ratio packing in M, L, XL, XXL. Single piece consumer orders are not accepted.
            </p>
          </div>

          {/* Specification Pills */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-3 rounded-lg border border-[#E7E0D5]">
              <span className="text-[#78716C] block text-[10px] uppercase font-semibold">Fabric</span>
              <span className="font-bold text-[#1C1917]">{product.fabric}</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-[#E7E0D5]">
              <span className="text-[#78716C] block text-[10px] uppercase font-semibold">Primary Color</span>
              <span className="font-bold text-[#1C1917]">{product.color}</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-[#E7E0D5]">
              <span className="text-[#78716C] block text-[10px] uppercase font-semibold">Stock Availability</span>
              <span className="font-bold text-emerald-700 capitalize flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ready Stock in Warehouse</span>
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-[#E7E0D5]">
              <span className="text-[#78716C] block text-[10px] uppercase font-semibold">Dispatch Window</span>
              <span className="font-bold text-[#1C1917]">Within 24-48 Hours</span>
            </div>
          </div>

          {/* Available Sizes Breakdown */}
          {product.variants?.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1C1917] block">
                Available Size Ratio Packing:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {product.variants.map((v) => (
                  <div
                    key={v.size}
                    className="px-3 py-1.5 rounded bg-white border border-[#E7E0D5] font-mono text-xs font-bold text-[#1C1917]"
                  >
                    Size {v.size}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="space-y-2 pt-2 border-t border-[#E7E0D5]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1C1917] block">
                Design Specifications & Work Details
              </span>
              <p className="text-xs text-[#57534E] leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* B2B Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-[#E7E0D5]">
            <a
              href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-lg bg-[#25D366] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:bg-[#20ba59] transition-all"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Inquire on WhatsApp for Code {product.code}</span>
            </a>

            <Link
              href="/contact"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-white border border-[#722F37] text-[#722F37] font-bold text-xs uppercase tracking-wider hover:bg-[#722F37] hover:text-white transition-all"
            >
              <span>Submit Formal Showroom Inquiry</span>
            </Link>
          </div>

          {/* Assurance Notes */}
          <div className="pt-2 text-[11px] text-[#78716C] space-y-1.5 border-t border-[#E7E0D5]">
            <div className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Door delivery via trusted transport (V-Trans, TCI, SafeXpress)</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Tax invoice with 5% GST billing for registered firms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Wholesale Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-20 pt-12 border-t border-[#E7E0D5]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif-luxury text-2xl font-bold text-[#1C1917]">
              Related Wholesale Designs
            </h2>
            <Link
              href="/collections"
              className="text-xs font-bold text-[#722F37] uppercase tracking-wider hover:underline"
            >
              View All Kurtis →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      <ImageLightbox
        images={images}
        currentIndex={selectedImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={(idx) => setSelectedImageIndex(idx)}
      />
    </div>
  );
}
