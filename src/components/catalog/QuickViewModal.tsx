'use client';

import React, { useState } from 'react';
import { CatalogProductView } from '@/types';
import { formatINR, getProductFallbackImage } from '@/lib/utils';
import { SelectedItemState } from './DesignSelector';
import { FabricMagnifier } from '@/components/ui/FabricMagnifier';
import {
  X,
  Plus,
  Minus,
  Sparkles,
  Maximize2,
  CheckCircle2,
  Package,
  Scissors,
  Layers,
  Truck,
  ShoppingBag,
  PhoneCall,
  MessageSquare,
} from 'lucide-react';

interface QuickViewModalProps {
  product: CatalogProductView | null;
  selectedState?: SelectedItemState;
  isOpen: boolean;
  onClose: () => void;
  onSaveSelection: (productId: string, updatedState: SelectedItemState | null) => void;
  onOpenLightbox: (product: CatalogProductView) => void;
}

export function QuickViewModal({
  product,
  selectedState,
  isOpen,
  onClose,
  onSaveSelection,
  onOpenLightbox,
}: QuickViewModalProps) {
  if (!isOpen || !product) return null;

  const moq = product.moq || 6;
  const initialTotal = selectedState?.totalQuantity || 0;
  const initialSets = selectedState?.sets || (initialTotal > 0 ? Math.max(1, Math.round(initialTotal / moq)) : 0);

  const [sets, setSets] = useState<number>(initialSets);
  const [notes, setNotes] = useState(selectedState?.notes || '');

  const totalQuantity = sets * moq;
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919830729210';

  const handleSetDelta = (delta: number) => {
    setSets((prev) => Math.max(0, prev + delta));
  };

  const handleConfirm = () => {
    if (sets === 0) {
      onSaveSelection(product.id, null);
    } else {
      const sizes = product.variants?.length ? product.variants.map((v) => v.size) : ['M', 'L', 'XL', 'XXL'];
      const perSize = Math.max(1, Math.ceil(moq / sizes.length)) * sets;
      const breakdown: Record<string, number> = {};
      sizes.forEach((s) => {
        breakdown[s] = perSize;
      });

      onSaveSelection(product.id, {
        productId: product.id,
        sets,
        sizeBreakdown: breakdown,
        totalQuantity,
        notes,
      });
    }
    onClose();
  };

  const primaryImg = product.images.find((img) => img.is_primary) || product.images[0];
  const fallbackSrc = getProductFallbackImage(product.style_type || product.category?.name);
  const imgSrc =
    (primaryImg as any)?.local_url || primaryImg?.image_url || fallbackSrc;

  const directWhatsAppUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hello Bhavya Fashions, I am inquiring about wholesale design: ${product.code} - ${product.title}\n• Category: ${product.category?.name || product.style_type}\n• Cloth Type: ${product.fabric}\n• Quoted Price: ₹${product.quoted_price}/pc\n• MOQ: ${moq} pcs set (Ratio pack)\nPlease confirm stock availability.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-[#E7E0D5] flex flex-col md:flex-row my-auto max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Left: High-Res Image with Fabric Magnifier on hover & Click to Enlarge */}
        <div className="relative md:w-5/12 bg-[#FAF7F2] shrink-0 flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-[#E7E0D5]">
          <div className="relative w-full aspect-[3/4] max-h-[380px] rounded-2xl overflow-hidden shadow-sm group">
            <FabricMagnifier
              src={imgSrc}
              alt={product.title}
              zoomLevel={2.6}
              fallbackSrc={fallbackSrc}
              className="w-full h-full"
              onImageClick={() => {
                onClose();
                onOpenLightbox(product);
              }}
            />

            <span className="absolute top-3 left-3 bg-black/85 text-[#C5A059] font-mono text-xs font-bold px-2 py-0.5 rounded shadow pointer-events-none z-10">
              {product.code}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenLightbox(product);
            }}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#722F37] hover:underline cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Fullscreen Lightbox View</span>
          </button>
        </div>

        {/* Right: Specifications & Add to WhatsApp Cart */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between overflow-y-auto space-y-4">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#722F37] font-bold bg-[#722F37]/10 px-2.5 py-0.5 rounded-full border border-[#722F37]/20">
                  {product.category?.name || product.style_type}
                </span>
                <h3 className="font-serif-luxury text-xl font-bold text-[#1C1917] mt-1.5">
                  {product.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-800"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quoted Wholesale Price or Request on Quote */}
            <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E7E0D5] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase text-[#78716C] font-semibold block mb-0.5">
                  Wholesale Trade Price
                </span>
                {product.price_display_mode === 'show' ? (
                  <div>
                    <span className="text-xl font-extrabold text-[#722F37]">
                      {formatINR(product.quoted_price)}
                    </span>
                    <span className="text-xs text-[#78716C] ml-1">/ pc (+GST)</span>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#722F37] bg-[#722F37]/10 px-3 py-1 rounded-full border border-[#722F37]/25">
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Price on Enquiry</span>
                  </span>
                )}
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase text-[#78716C] font-semibold block mb-0.5">
                  MOQ Packing
                </span>
                <span className="text-xs font-bold text-[#1C1917] bg-white border border-[#E7E0D5] px-2.5 py-1 rounded-md inline-block">
                  {moq} Pcs Full Ratio Pack
                </span>
              </div>
            </div>

            {/* Comprehensive Specifications Grid: Cloth Type, Materials, Details */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl border border-[#E7E0D5] bg-[#FAF7F2]">
                <span className="text-[10px] uppercase text-[#78716C] font-semibold flex items-center gap-1">
                  <Scissors className="w-3 h-3 text-[#722F37]" />
                  <span>Cloth Type / Fabric</span>
                </span>
                <span className="font-bold text-[#1C1917] block mt-0.5">
                  {product.fabric}
                </span>
              </div>

              <div className="p-2.5 rounded-xl border border-[#E7E0D5] bg-[#FAF7F2]">
                <span className="text-[10px] uppercase text-[#78716C] font-semibold flex items-center gap-1">
                  <Layers className="w-3 h-3 text-[#722F37]" />
                  <span>Category / Silhouette</span>
                </span>
                <span className="font-bold text-[#1C1917] block mt-0.5">
                  {product.category?.name || product.style_type}
                </span>
              </div>

              <div className="p-2.5 rounded-xl border border-[#E7E0D5] bg-[#FAF7F2]">
                <span className="text-[10px] uppercase text-[#78716C] font-semibold flex items-center gap-1">
                  <Package className="w-3 h-3 text-[#722F37]" />
                  <span>Ratio Sizes Included</span>
                </span>
                <span className="font-bold text-[#1C1917] block mt-0.5">
                  M, L, XL, XXL (Equal Ratio)
                </span>
              </div>

              <div className="p-2.5 rounded-xl border border-[#E7E0D5] bg-[#FAF7F2]">
                <span className="text-[10px] uppercase text-[#78716C] font-semibold flex items-center gap-1">
                  <Truck className="w-3 h-3 text-[#722F37]" />
                  <span>Availability</span>
                </span>
                <span className="font-bold text-emerald-700 block mt-0.5">
                  Ready Stock • Express Dispatch
                </span>
              </div>
            </div>

            {/* Description & Work Details */}
            {product.description && (
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/60">
                <span className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider block mb-1">
                  Product Details &amp; Work
                </span>
                <p className="text-xs text-[#57534E] leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Set Selection for WhatsApp Cart */}
            <div className="pt-2 border-t border-[#E7E0D5] space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#1C1917] block">
                    Add to WhatsApp Inquiry Cart:
                  </span>
                  <span className="text-[11px] text-[#78716C]">
                    Each set contains {moq} pieces across standard ratio sizes.
                  </span>
                </div>

                {/* Sets Stepper */}
                <div className="flex items-center border border-[#722F37]/30 rounded-xl bg-white overflow-hidden shadow-xs">
                  <button
                    type="button"
                    onClick={() => handleSetDelta(-1)}
                    className="w-9 h-9 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 transition-colors"
                    aria-label="Decrease sets"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-xs font-bold font-mono text-zinc-900 min-w-16 text-center">
                    {sets} {sets === 1 ? 'Set' : 'Sets'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSetDelta(1)}
                    className="w-9 h-9 flex items-center justify-center bg-[#722F37] text-white hover:bg-[#58111A] transition-colors"
                    aria-label="Increase sets"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Design Notes */}
              {sets > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <MessageSquare className="w-3.5 h-3.5 text-[#78716C] shrink-0" />
                  <input
                    type="text"
                    placeholder="Custom notes (e.g. tag preference, urgent shipping date)..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-[#E7E0D5] flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase text-[#78716C] block">Indicative Subtotal</span>
              <span className="text-base font-extrabold text-[#722F37]">
                {formatINR(totalQuantity * product.quoted_price)}
                <span className="text-[11px] font-normal text-zinc-500 ml-1">
                  ({totalQuantity} pcs)
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={directWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white transition-colors flex items-center justify-center shadow-xs"
                title="Direct WhatsApp Quote"
              >
                <PhoneCall className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={handleConfirm}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#722F37] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5C1D24] shadow-sm cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#C5A059]" />
                <span>{sets > 0 ? 'Update WhatsApp Cart' : 'Done'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

