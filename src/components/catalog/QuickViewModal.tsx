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
  ShieldCheck,
  Package,
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
  const sizes = product.variants?.length
    ? product.variants.map((v) => v.size)
    : ['M', 'L', 'XL', 'XXL'];

  const [sizeBreakdown, setSizeBreakdown] = useState<Record<string, number>>(
    selectedState?.sizeBreakdown || {}
  );
  const [notes, setNotes] = useState(selectedState?.notes || '');

  const totalSelected = Object.values(sizeBreakdown).reduce((sum, q) => sum + (q || 0), 0);
  const moqMet = totalSelected >= moq;

  const handleDelta = (sz: string, delta: number) => {
    const cur = sizeBreakdown[sz] || 0;
    const next = Math.max(0, cur + delta);
    const updated = { ...sizeBreakdown };
    if (next > 0) {
      updated[sz] = next;
    } else {
      delete updated[sz];
    }
    setSizeBreakdown(updated);
  };

  const handleQuickAddRatio = (multiplier = 1) => {
    const perSize = Math.max(1, Math.ceil(moq / sizes.length)) * multiplier;
    const updated: Record<string, number> = {};
    sizes.forEach((s) => {
      updated[s] = perSize;
    });
    setSizeBreakdown(updated);
  };

  const handleConfirm = () => {
    if (totalSelected === 0) {
      onSaveSelection(product.id, null);
    } else {
      onSaveSelection(product.id, {
        productId: product.id,
        sizeBreakdown,
        totalQuantity: totalSelected,
        notes,
      });
    }
    onClose();
  };

  const primaryImg = product.images.find((img) => img.is_primary) || product.images[0];
  const fallbackSrc = getProductFallbackImage(product.style_type);
  const imgSrc =
    (primaryImg as any)?.local_url || primaryImg?.image_url || fallbackSrc;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
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

            <span className="absolute top-3 left-3 bg-black/80 text-white font-mono text-xs px-2 py-0.5 rounded shadow pointer-events-none z-10">
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

        {/* Right: Specifications & Size Pack Stepper */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between overflow-y-auto space-y-5">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#722F37] font-bold">
                  {product.style_type} • {product.fabric}
                </span>
                <h3 className="font-serif-luxury text-xl font-bold text-[#1C1917] mt-0.5">
                  {product.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quoted Wholesale Price or Request on Quote */}
            <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E7E0D5] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase text-[#78716C] font-semibold block mb-0.5">
                  Trade Price
                </span>
                {product.price_display_mode === 'show' ? (
                  <div>
                    <span className="text-xl font-extrabold text-[#722F37]">
                      {formatINR(product.quoted_price)}
                    </span>
                    <span className="text-xs text-[#78716C] ml-1">/ pc</span>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#722F37] bg-[#722F37]/10 px-3 py-1 rounded-full border border-[#722F37]/25">
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Request on Quote</span>
                  </span>
                )}
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase text-[#78716C] font-semibold block mb-0.5">
                  MOQ Rule
                </span>
                <span className="text-xs font-bold text-[#1C1917]">
                  {moq} Pcs Ratio Pack
                </span>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-xs text-[#57534E] leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Size Breakdown Stepper */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-[#1C1917] flex items-center justify-between">
                <span>Select Pieces Per Size:</span>
                <span className={`text-[11px] font-semibold ${moqMet ? 'text-emerald-700' : 'text-amber-800'}`}>
                  Selected: {totalSelected} / {moq} pcs MOQ
                </span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {sizes.map((sz) => {
                  const qty = sizeBreakdown[sz] || 0;
                  return (
                    <div
                      key={sz}
                      className="p-2 rounded-xl bg-white border border-[#E7E0D5] text-center space-y-1 shadow-2xs"
                    >
                      <span className="text-xs font-bold text-[#1C1917] block font-mono">
                        {sz}
                      </span>
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDelta(sz, -1)}
                          className="w-6 h-6 rounded-md bg-[#FAF7F2] hover:bg-[#EFE9E0] text-zinc-700 flex items-center justify-center text-xs font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold font-mono w-5">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDelta(sz, 1)}
                          className="w-6 h-6 rounded-md bg-[#FAF7F2] hover:bg-[#EFE9E0] text-zinc-700 flex items-center justify-center text-xs font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleQuickAddRatio(1)}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#FAF7F2] border border-[#E7E0D5] text-[#722F37] hover:bg-[#EFE9E0]"
                >
                  + Add 1 Ratio Pack ({moq} pcs)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAddRatio(2)}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#FAF7F2] border border-[#E7E0D5] text-[#722F37] hover:bg-[#EFE9E0]"
                >
                  + Add 2 Ratio Packs ({moq * 2} pcs)
                </button>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-[#E7E0D5] flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase text-[#78716C] block">Indicative Subtotal</span>
              <span className="text-sm font-extrabold text-[#722F37]">
                {formatINR(totalSelected * product.quoted_price)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl border border-[#E7E0D5] text-xs font-bold text-zinc-600 hover:bg-zinc-50"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#722F37] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5C1D24] shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{totalSelected > 0 ? 'Save Selection' : 'Done'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
