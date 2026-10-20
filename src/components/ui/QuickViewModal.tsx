'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Product, PriceDisplayMode } from '@/types';
import { formatINR, getProductFallbackImage } from '@/lib/utils';
import { resolvePriceDisplayMode } from '@/lib/utils/price-policy';
import { ProductEnquiryModal } from '@/components/ui/ProductEnquiryModal';
import {
  X,
  PhoneCall,
  Sparkles,
  ShieldCheck,
  Check,
  Plus,
  Layers,
  ChevronRight,
  Maximize2,
  Minimize2,
  FileText,
} from 'lucide-react';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  priceModeOverride?: PriceDisplayMode;
  onSelectProduct?: (product: Product) => void;
  isSelected?: boolean;
}

export function QuickViewModal({
  product,
  onClose,
  priceModeOverride,
  onSelectProduct,
  isSelected = false,
}: QuickViewModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);

  // Keyboard Escape listener
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isZoomed) {
          setIsZoomed(false);
        } else if (!enquiryModalOpen) {
          onClose();
        }
      }
    },
    [isZoomed, enquiryModalOpen, onClose]
  );

  useEffect(() => {
    if (product) {
      window.addEventListener('keydown', handleKeyDown);
      // Prevent background scrolling while open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [product, handleKeyDown]);

  if (!product) return null;

  const images = product.images?.length > 0
    ? product.images
    : [{ id: 'placeholder', image_url: '/images/bhavya-hero-banner.jpg', display_order: 0, is_primary: true }];

  const currentImage = images[activeImageIndex] || images[0];
  const priceMode = resolvePriceDisplayMode(product, undefined, priceModeOverride || 'show');
  const isPriceVisible = priceMode === 'show' && product.base_wholesale_price > 0;

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919830729210';
  const whatsappMessage = isPriceVisible
    ? `Hello Bhavya Fashions, I am interested in wholesale order for design: ${product.code} - ${product.title} (Price: ${formatINR(product.base_wholesale_price)}/pc, MOQ: ${product.moq} pcs). Please confirm live stock.`
    : `Hello Bhavya Fashions, I am inquiring about wholesale quotation for design: ${product.code} - ${product.title} (MOQ: ${product.moq} pcs). Please provide tiered B2B pricing.`;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal Dialog */}
        <div className="relative w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-[#E7E0D5] z-10 my-auto animate-in fade-in zoom-in-95 duration-200">
          {/* Top Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 rounded-full bg-white/90 text-zinc-700 hover:text-black hover:bg-white shadow-md transition-colors"
            aria-label="Close Quick View"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 max-h-[90vh] overflow-y-auto">
            {/* Left Column: Image Showcase with Zoom & Thumbnails */}
            <div className="md:col-span-6 bg-[#FAF7F2] p-4 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#E7E0D5]">
              {(() => {
                const fallbackSrc = getProductFallbackImage(product.style_type || product.category?.name);
                const mainImgSrc =
                  (currentImage as any)?.local_url ||
                  currentImage?.image_url ||
                  fallbackSrc;

                return (
                  <>
                    <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-md bg-white border border-[#E7E0D5] group/zoom">
                      <img
                        src={mainImgSrc}
                        alt={product.title}
                        className={`w-full h-full object-cover object-top transition-transform duration-300 ${
                          isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                        }`}
                        onClick={() => setIsZoomed(!isZoomed)}
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src !== fallbackSrc) {
                            target.src = fallbackSrc;
                          }
                        }}
                      />

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                        <span className="bg-black/80 backdrop-blur-md text-[#C5A059] font-mono text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm">
                          {product.code}
                        </span>
                        {product.is_featured && (
                          <span className="bg-[#C5A059] text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Featured</span>
                          </span>
                        )}
                      </div>

                      {/* Zoom toggle button */}
                      <button
                        type="button"
                        onClick={() => setIsZoomed(!isZoomed)}
                        className="absolute bottom-3 right-3 p-2 rounded-full bg-white/90 text-zinc-800 shadow-md hover:bg-white transition-all opacity-80 group-hover/zoom:opacity-100"
                        aria-label={isZoomed ? 'Zoom out' : 'Zoom in'}
                      >
                        {isZoomed ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Thumbnail strip */}
                    {images.length > 1 && (
                      <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
                        {images.map((img, idx) => {
                          const thumbSrc =
                            (img as any)?.local_url ||
                            img.image_url ||
                            fallbackSrc;
                          return (
                            <button
                              key={img.id || idx}
                              onClick={() => {
                                setActiveImageIndex(idx);
                                setIsZoomed(false);
                              }}
                              className={`w-14 h-18 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                                activeImageIndex === idx
                                  ? 'border-[#722F37] scale-105 shadow-sm'
                                  : 'border-transparent opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img
                                src={thumbSrc}
                                alt=""
                                className="w-full h-full object-cover object-top"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  if (target.src !== fallbackSrc) {
                                    target.src = fallbackSrc;
                                  }
                                }}
                              />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Right Column: Specs & B2B Wholesale Details */}
            <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#722F37] font-semibold bg-[#722F37]/10 px-2.5 py-0.5 rounded-full">
                    {product.style_type}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span>In Stock • Ready Dispatch</span>
                  </span>
                </div>

                <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1C1917] tracking-tight leading-snug">
                  {product.title}
                </h2>

                {/* Wholesale Pricing Display Box */}
                <div className="bg-[#FAF7F2] border border-[#E7E0D5] p-4 rounded-xl flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 block font-medium">
                      Wholesale Price
                    </span>
                    {product.price_on_enquiry !== false && product.price_on_request !== false ? (
                      <div className="space-y-1">
                        <span className="inline-block text-base font-bold text-[#722F37] bg-white border border-[#E7E0D5] px-2.5 py-0.5 rounded-lg shadow-2xs">
                          Price on Enquiry
                        </span>
                        <p className="text-[10px] text-zinc-500">Official quote provided on request</p>
                      </div>
                    ) : isPriceVisible && product.base_wholesale_price ? (
                      <div className="text-2xl font-bold text-[#722F37] tracking-tight">
                        {formatINR(product.base_wholesale_price)}
                        <span className="text-xs font-normal text-zinc-500 ml-1">/ piece + GST</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="inline-block text-base font-bold text-[#722F37] bg-white border border-[#E7E0D5] px-2.5 py-0.5 rounded-lg shadow-2xs">
                          Price on Enquiry
                        </span>
                        <p className="text-[10px] text-zinc-500">Contact sales for wholesale quotation</p>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="inline-block bg-[#1C1917] text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                      MOQ: {product.moq ? `${product.moq} pcs` : 'On Request'}
                    </span>
                  </div>
                </div>

                {/* Price on Request Action if price is hidden */}
                {!isPriceVisible && (
                  <button
                    type="button"
                    onClick={() => setEnquiryModalOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#722F37] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#58111A] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-[#C5A059]" />
                    <span>Enquire for Price & Quotation</span>
                  </button>
                )}

                {/* Fabric & Color Specs */}
                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div className="border border-[#E7E0D5] p-2.5 rounded-xl bg-white">
                    <span className="text-[10px] uppercase text-zinc-400 block font-medium">Fabric Type</span>
                    <span className="font-semibold text-zinc-900">{product.fabric}</span>
                  </div>
                  <div className="border border-[#E7E0D5] p-2.5 rounded-xl bg-white">
                    <span className="text-[10px] uppercase text-zinc-400 block font-medium">Color Tone</span>
                    <span className="font-semibold text-zinc-900">{product.color}</span>
                  </div>
                </div>

                {/* Size Breakdown */}
                {product.variants?.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-800">Available Ratio Sizes:</span>
                      <span className="text-[10px] text-zinc-500 font-mono">Standard Ratio Set</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {product.variants.map((v) => (
                        <span
                          key={v.size}
                          className="text-xs font-semibold px-2.5 py-1 bg-white border border-[#E7E0D5] rounded-lg text-zinc-800 font-mono shadow-2xs"
                        >
                          {v.size}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Wholesale Trust Notice */}
                <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 pt-1">
                  <ShieldCheck className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <span>GST Billing • Surat & Barabazar Hubs • Pan-India Transport</span>
                </div>
              </div>

              {/* Action CTAs */}
              <div className="space-y-2.5 pt-4 border-t border-[#E7E0D5]">
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Select Product CTA if callback provided */}
                  {onSelectProduct ? (
                    <button
                      type="button"
                      onClick={() => onSelectProduct(product)}
                      className={`inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-[#FAF7F2] text-zinc-900 border border-[#E7E0D5] hover:border-[#722F37]'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Selected</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 text-[#722F37]" />
                          <span>Select Design</span>
                        </>
                      )}
                    </button>
                  ) : null}

                  {/* WhatsApp Quick Message */}
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#25D366] text-white text-xs uppercase font-bold tracking-wider hover:bg-[#20ba59] shadow-md transition-all ${
                      !onSelectProduct ? 'col-span-2' : ''
                    }`}
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>WhatsApp Desk</span>
                  </a>
                </div>

                <Link
                  href={`/products/${product.slug}`}
                  onClick={onClose}
                  className="w-full inline-flex items-center justify-center gap-1 py-2 text-xs font-semibold text-[#722F37] hover:underline"
                >
                  <span>View Complete Product & Ratio Page</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Enquiry Modal for Price on Request */}
      <ProductEnquiryModal
        product={product}
        isOpen={enquiryModalOpen}
        onClose={() => setEnquiryModalOpen(false)}
      />
    </>
  );
}
