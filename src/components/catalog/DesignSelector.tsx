'use client';

import React from 'react';
import { CatalogProductView } from '@/types';
import { formatINR, getProductFallbackImage } from '@/lib/utils';
import { CheckCircle2, AlertCircle, Plus, Minus, MessageSquare, Eye, Maximize2, Sparkles } from 'lucide-react';

export interface SelectedItemState {
  productId: string;
  sizeBreakdown: Record<string, number>;
  totalQuantity: number;
  notes: string;
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
  allowSizes = true,
  allowQuantity = true,
}: DesignSelectorProps) {
  const isSelected = Boolean(selectedState && selectedState.totalQuantity > 0);
  const primaryImg = product.images.find(img => img.is_primary) || product.images[0];
  const moq = product.moq;
  const currentTotal = selectedState?.totalQuantity || 0;
  const moqMet = currentTotal >= moq;

  const handleSizeChange = (size: string, delta: number) => {
    const currentBreakdown = { ...(selectedState?.sizeBreakdown || {}) };
    const currentSizeQty = currentBreakdown[size] || 0;
    const newSizeQty = Math.max(0, currentSizeQty + delta);

    if (newSizeQty > 0) {
      currentBreakdown[size] = newSizeQty;
    } else {
      delete currentBreakdown[size];
    }

    const newTotal = Object.values(currentBreakdown).reduce((sum, q) => sum + q, 0);

    if (newTotal === 0) {
      onChange(product.id, null);
    } else {
      onChange(product.id, {
        productId: product.id,
        sizeBreakdown: currentBreakdown,
        totalQuantity: newTotal,
        notes: selectedState?.notes || '',
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

  const handleQuickAddMoq = () => {
    // Distribute MOQ evenly across available sizes
    const sizes = product.variants?.length ? product.variants.map(v => v.size) : ['M', 'L', 'XL', 'XXL'];
    const perSize = Math.max(1, Math.ceil(moq / sizes.length));
    const newBreakdown: Record<string, number> = {};
    sizes.forEach(s => {
      newBreakdown[s] = perSize;
    });
    const total = Object.values(newBreakdown).reduce((a, b) => a + b, 0);

    onChange(product.id, {
      productId: product.id,
      sizeBreakdown: newBreakdown,
      totalQuantity: total,
      notes: selectedState?.notes || '',
    });
  };

  return (
    <div
      className={`relative bg-white border rounded-xl overflow-hidden transition-all duration-200 ${
        isSelected
          ? 'border-[#722F37] shadow-md ring-1 ring-[#722F37]/30'
          : 'border-[#E7E0D5] hover:border-[#C5A059] shadow-sm'
      }`}
    >
      {/* Pinned / Presentation Note Ribbon */}
      {product.presentation_note && (
        <div className="bg-[#FAF7F2] border-b border-[#E7E0D5] px-3 py-1.5 text-xs text-[#722F37] font-medium flex items-center gap-1.5">
          <span>{product.presentation_note}</span>
        </div>
      )}

      <div className="p-4 sm:p-5 flex flex-col md:flex-row gap-5">
        {/* Thumbnail Image */}
        {(() => {
          const fallbackSrc = getProductFallbackImage(product.style_type);
          const imgSrc =
            (primaryImg as any)?.local_url ||
            primaryImg?.image_url ||
            fallbackSrc;
          return (
            <div className="shrink-0 w-full md:w-36 flex flex-col items-center">
              <div
                className="relative w-full aspect-[3/4] bg-[#EFE9E0] rounded-lg overflow-hidden cursor-pointer group"
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
                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-semibold uppercase tracking-wider gap-1">
                  <Eye className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Click for Quick View</span>
                </div>
                <span className="absolute top-2 left-2 bg-black/80 text-white font-mono text-[10px] px-1.5 py-0.5 rounded">
                  {product.code}
                </span>
              </div>

              {/* Quick View & Enlarge Action Buttons */}
              <div className="mt-2 flex items-center gap-1.5 w-full">
                {onQuickView && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickView(product);
                    }}
                    className="flex-1 py-1 px-1.5 bg-[#FAF7F2] hover:bg-[#722F37] hover:text-white border border-[#E7E0D5] rounded text-[10px] font-semibold text-[#1C1917] flex items-center justify-center gap-1 transition-colors"
                    title="Quick View specifications and size breakdown"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Quick View</span>
                  </button>
                )}
                {onOpenLightbox && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenLightbox(product);
                    }}
                    className="p-1 px-1.5 bg-[#FAF7F2] hover:bg-[#722F37] hover:text-white border border-[#E7E0D5] rounded text-[10px] font-semibold text-[#1C1917] flex items-center gap-0.5 transition-colors"
                    title="Enlarge & Fullscreen View"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span className="hidden sm:inline">Enlarge</span>
                  </button>
                )}
              </div>
            </div>
          );
        })()}

        {/* Product Details & Selection Matrix */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#78716C] font-medium">
                  {product.style_type} • {product.fabric}
                </span>
                <h3 className="font-serif-luxury text-lg font-bold text-[#1C1917] mt-0.5">
                  {product.title}
                </h3>
              </div>

              {/* Quoted Price */}
              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase text-[#78716C] block font-semibold">Trade Price</span>
                {product.price_display_mode === 'show' && product.price_on_enquiry === false ? (
                  <div>
                    <span className="text-lg font-extrabold text-[#722F37]">
                      {formatINR(product.quoted_price)}
                    </span>
                    <span className="text-xs text-[#78716C] ml-1">/ pc</span>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#722F37] bg-[#722F37]/10 px-2.5 py-0.5 rounded-full border border-[#722F37]/20">
                    <Sparkles className="w-3 h-3 text-[#C5A059]" />
                    <span>Price on Enquiry</span>
                  </span>
                )}
              </div>
            </div>

            {/* Description / Highlights */}
            {product.description && (
              <p className="text-xs text-[#57534E] mt-2 line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* MOQ & Ratio requirement notification */}
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F3ECE2] text-[#44403C]">
                MOQ: {moq} pieces per design
              </span>

              {isSelected && (
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    moqMet
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {moqMet ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>MOQ Met ({currentTotal} pcs selected)</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Need {moq - currentTotal} more pcs to meet MOQ</span>
                    </>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Interactive Size Breakdown & Quantity Inputs */}
          {allowQuantity && (
            <div className="mt-4 pt-4 border-t border-[#F3ECE2]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs font-semibold text-[#1C1917] uppercase tracking-wider">
                  Select Quantity by Size (Ratio Packing):
                </span>

                {!isSelected && (
                  <button
                    type="button"
                    onClick={handleQuickAddMoq}
                    className="text-xs text-[#722F37] font-semibold hover:underline flex items-center gap-1 self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Quick Add Set ({moq} pcs)</span>
                  </button>
                )}
              </div>

              {/* Size Buttons Grid */}
              <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(product.variants?.length ? product.variants : [{ size: 'M' }, { size: 'L' }, { size: 'XL' }, { size: 'XXL' }]).map((variant) => {
                  const size = variant.size;
                  const qty = selectedState?.sizeBreakdown[size] || 0;

                  return (
                    <div
                      key={size}
                      className={`p-2 rounded-lg border flex flex-col items-center justify-between transition-colors ${
                        qty > 0
                          ? 'border-[#722F37] bg-[#722F37]/5'
                          : 'border-[#E7E0D5] bg-[#FAF7F2]'
                      }`}
                    >
                      <span className="text-xs font-bold text-[#1C1917] font-mono">{size}</span>
                      
                      <div className="flex items-center gap-2 mt-1.5">
                        <button
                          type="button"
                          onClick={() => handleSizeChange(size, -1)}
                          disabled={qty === 0}
                          className="w-6 h-6 rounded bg-white border border-[#E7E0D5] flex items-center justify-center text-[#1C1917] hover:bg-[#EFE9E0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          aria-label={`Decrease ${size}`}
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <span className="text-xs font-bold font-mono min-w-4 text-center">
                          {qty}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleSizeChange(size, 1)}
                          className="w-6 h-6 rounded bg-[#722F37] text-white flex items-center justify-center hover:bg-[#5C1D24] transition-colors shadow-xs"
                          aria-label={`Increase ${size}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Design Note Input (shown once selected) */}
              {isSelected && (
                <div className="mt-3 flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-[#78716C] shrink-0" />
                  <input
                    type="text"
                    placeholder="Note for this design (e.g. need 3XL if available, tag preferences)..."
                    value={selectedState?.notes || ''}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    className="w-full text-xs py-1.5 px-2.5 rounded border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
