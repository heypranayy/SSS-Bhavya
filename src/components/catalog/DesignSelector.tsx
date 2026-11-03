'use client';

import React from 'react';
import { CatalogProductView } from '@/types';
import { formatINR, getProductFallbackImage } from '@/lib/utils';
import {
  CheckCircle2,
  Plus,
  Minus,
  MessageSquare,
  Eye,
  Maximize2,
  Sparkles,
  ShoppingBag,
  PhoneCall,
  Layers,
  Scissors,
  Truck,
  Package,
} from 'lucide-react';

export interface SelectedItemState {
  productId: string;
  sizeBreakdown: Record<string, number>;
  totalQuantity: number;
  notes: string;
  sets?: number;
}

interface DesignSelectorProps {
  product: CatalogProductView;
  selectedState?: SelectedItemState;
  onChange: (productId: string, updatedState: SelectedItemState | null) => void;
  onOpenLightbox?: (product: CatalogProductView) => void;
  onQuickView?: (product: CatalogProductView) => void;
  allowSizes?: boolean;
  allowQuantity?: boolean;
}

export function DesignSelector({
  product,
  selectedState,
  onChange,
  onOpenLightbox,
  onQuickView,
}: DesignSelectorProps) {
  const isSelected = Boolean(selectedState && selectedState.productId);
  const moq = product.moq || 6;
  const primaryImg = product.images.find(img => img.is_primary) || product.images[0];
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919830729210';

  const handleToggleSelect = () => {
    if (isSelected) {
      onChange(product.id, null);
    } else {
      onChange(product.id, {
        productId: product.id,
        sizeBreakdown: {},
        totalQuantity: 1,
        notes: '',
      });
    }
  };

  const handleNotesChange = (text: string) => {
    if (!selectedState) return;
    onChange(product.id, {
      ...selectedState,
      notes: text,
    });
  };

  const directWhatsAppUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hello Bhavya Fashions, I am inquiring about wholesale design: ${product.code} - ${product.title}\n• Category: ${product.category?.name || product.style_type}\n• Cloth Type: ${product.fabric}\n• Quoted Price: ₹${product.quoted_price}/pc\n• MOQ: ${moq} pcs set (Ratio pack)\nPlease confirm stock availability.`
  )}`;

  return (
    <div
      className={`relative bg-white border rounded-2xl overflow-hidden transition-all duration-200 ${
        isSelected
          ? 'border-[#722F37] shadow-md ring-1 ring-[#722F37]/30'
          : 'border-[#E7E0D5] hover:border-[#C5A059] shadow-xs'
      }`}
    >
      {/* Pinned / Presentation Note Ribbon */}
      {product.presentation_note && (
        <div className="bg-[#FAF7F2] border-b border-[#E7E0D5] px-4 py-1.5 text-xs text-[#722F37] font-medium flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>{product.presentation_note}</span>
        </div>
      )}

      <div className="p-4 sm:p-5 flex flex-col md:flex-row gap-5">
        {/* Thumbnail Image */}
        {(() => {
          const fallbackSrc = getProductFallbackImage(product.style_type || product.category?.name);
          const imgSrc =
            (primaryImg as any)?.local_url ||
            primaryImg?.image_url ||
            fallbackSrc;
          return (
            <div className="shrink-0 w-full md:w-44 flex flex-col items-center">
              <div
                className="relative w-full aspect-[3/4] bg-[#EFE9E0] rounded-xl overflow-hidden cursor-pointer group shadow-2xs"
                onClick={() => onQuickView ? onQuickView(product) : (onOpenLightbox && onOpenLightbox(product))}
              >
                <img
                  src={imgSrc}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== fallbackSrc) {
                      target.src = fallbackSrc;
                    }
                  }}
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-semibold uppercase tracking-wider gap-1.5">
                  <Eye className="w-4 h-4 text-[#C5A059]" />
                  <span>Quick View Specs</span>
                </div>
                <span className="absolute top-2.5 left-2.5 bg-black/85 backdrop-blur-xs text-[#C5A059] font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow">
                  {product.code}
                </span>
              </div>

              {/* Quick View & Enlarge Action Buttons */}
              <div className="mt-2.5 flex items-center gap-1.5 w-full">
                {onQuickView && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickView(product);
                    }}
                    className="flex-1 py-1.5 px-2 bg-[#FAF7F2] hover:bg-[#722F37] hover:text-white border border-[#E7E0D5] rounded-lg text-[11px] font-semibold text-[#1C1917] flex items-center justify-center gap-1 transition-colors"
                    title="Quick View specifications and material details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Specs</span>
                  </button>
                )}
                {onOpenLightbox && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenLightbox(product);
                    }}
                    className="p-1.5 bg-[#FAF7F2] hover:bg-[#722F37] hover:text-white border border-[#E7E0D5] rounded-lg text-[11px] font-semibold text-[#1C1917] flex items-center gap-1 transition-colors"
                    title="Enlarge & Fullscreen View"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })()}

        {/* Product Details & Specifications */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Header: Category Badge & Quoted Price */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#722F37] font-bold bg-[#722F37]/10 px-2.5 py-0.5 rounded-full border border-[#722F37]/20">
                    {product.category?.name || product.style_type}
                  </span>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span>Ready Stock</span>
                  </span>
                </div>

                <h3 className="font-serif-luxury text-lg sm:text-xl font-bold text-[#1C1917] mt-1.5">
                  {product.title}
                </h3>
              </div>

              {/* Quoted Price */}
              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase text-[#78716C] block font-semibold">Trade Price</span>
                {product.price_display_mode === 'show' ? (
                  <div>
                    <span className="text-xl font-extrabold text-[#722F37]">
                      {formatINR(product.quoted_price || product.base_wholesale_price)}
                    </span>
                    <span className="text-xs text-[#78716C] ml-1">/ pc (+GST)</span>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#722F37] bg-[#722F37]/10 px-2.5 py-0.5 rounded-full border border-[#722F37]/20">
                    <Sparkles className="w-3 h-3 text-[#C5A059]" />
                    <span>Price on Enquiry</span>
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-xs text-[#57534E] mt-2 line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Comprehensive Specifications Grid: Cloth Type, Materials, Details */}
            <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E7E0D5]">
                <span className="text-[10px] uppercase text-[#78716C] font-semibold flex items-center gap-1">
                  <Scissors className="w-3 h-3 text-[#722F37]" />
                  <span>Cloth Type</span>
                </span>
                <span className="font-bold text-[#1C1917] block mt-0.5 truncate" title={product.fabric}>
                  {product.fabric}
                </span>
              </div>

              <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E7E0D5]">
                <span className="text-[10px] uppercase text-[#78716C] font-semibold flex items-center gap-1">
                  <Layers className="w-3 h-3 text-[#722F37]" />
                  <span>Category</span>
                </span>
                <span className="font-bold text-[#1C1917] block mt-0.5 truncate" title={product.style_type}>
                  {product.style_type}
                </span>
              </div>

              <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E7E0D5]">
                <span className="text-[10px] uppercase text-[#78716C] font-semibold flex items-center gap-1">
                  <Package className="w-3 h-3 text-[#722F37]" />
                  <span>Packing Ratio</span>
                </span>
                <span className="font-bold text-[#1C1917] block mt-0.5">
                  {moq} pcs set (M-XXL)
                </span>
              </div>

              <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E7E0D5]">
                <span className="text-[10px] uppercase text-[#78716C] font-semibold flex items-center gap-1">
                  <Truck className="w-3 h-3 text-[#722F37]" />
                  <span>Dispatch Hub</span>
                </span>
                <span className="font-bold text-[#1C1917] block mt-0.5">
                  Central Factory &amp; Barabazar
                </span>
              </div>
            </div>
          </div>

          {/* Add to WhatsApp Inquiry Action Bar (Single Product Inquiry) */}
          {!isSelected ? (
            <div className="mt-4 pt-4 border-t border-[#F3ECE2] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="text-xs text-[#78716C]">
                <span className="font-semibold text-[#1C1917]">Wholesale Inquiry:</span> Add design to inquiry list. Quantities, ratio packing &amp; delivery discussed directly on call.
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleSelect}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#722F37] hover:bg-[#58111A] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-[#C5A059]" />
                  <span>Add to WhatsApp Inquiry</span>
                </button>

                <a
                  href={directWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white transition-colors flex items-center justify-center shadow-sm"
                  title="Direct WhatsApp Quote for this design"
                >
                  <PhoneCall className="w-4 h-4" />
                </a>
              </div>
            </div>
          ) : (
            <div className="mt-4 pt-3.5 border-t border-emerald-200 bg-emerald-50/60 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 p-4 sm:p-5 rounded-b-xl space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Added to WhatsApp Inquiry</span>
                  </span>
                  <span className="text-xs text-zinc-500 hidden sm:inline">• Discussion on call</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleSelect}
                    className="text-xs text-red-600 hover:text-red-700 hover:underline px-2.5 py-1 font-semibold rounded-lg border border-red-200 bg-white"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Design Note Input */}
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-[#78716C] shrink-0" />
                <input
                  type="text"
                  placeholder="Custom note for this design (e.g. tag preference, urgent dispatch)..."
                  value={selectedState?.notes || ''}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-emerald-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
