'use client';

import React, { useState } from 'react';
import { CatalogProductView } from '@/types';
import { SelectedItemState } from './DesignSelector';
import { formatINR } from '@/lib/utils';
import { Send, ChevronUp, ChevronDown, Trash2, CheckCircle2 } from 'lucide-react';

interface SelectedDesignsDrawerProps {
  products: CatalogProductView[];
  selections: Map<string, SelectedItemState>;
  onClearAll: () => void;
  onRemoveItem: (productId: string) => void;
  onSubmitInquiry: () => void;
  onOpenWhatsApp: () => void;
}

export function SelectedDesignsDrawer({
  products,
  selections,
  onClearAll,
  onRemoveItem,
  onSubmitInquiry,
  onOpenWhatsApp,
}: SelectedDesignsDrawerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const selectedArray = Array.from(selections.values()).filter(s => s.totalQuantity > 0);
  if (selectedArray.length === 0) return null;

  const productMap = new Map(products.map(p => [p.id, p]));

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#E7E0D5] shadow-2xl transition-all pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {/* Expanded Breakdown Drawer */}
      {isExpanded && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 max-h-[50vh] overflow-y-auto border-b border-[#E7E0D5]">
          <div className="flex items-center justify-between pb-3 border-b border-[#F3ECE2]">
            <h4 className="font-serif-luxury font-bold text-sm text-[#1C1917]">
              Shortlisted Wholesale Designs ({selectedArray.length})
            </h4>

            <button
              type="button"
              onClick={onClearAll}
              className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-medium cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>

          <div className="divide-y divide-[#F3ECE2]">
            {selectedArray.map(sel => {
              const prod = productMap.get(sel.productId);
              if (!prod) return null;
              const primaryImg = prod.images.find(i => i.is_primary) || prod.images[0];
              const imgSrc = (primaryImg as any)?.local_url || primaryImg?.image_url || '/images/cat-3piece.jpg';

              return (
                <div key={sel.productId} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={imgSrc}
                      alt=""
                      className="w-12 h-14 object-cover rounded-lg bg-[#EFE9E0] shrink-0 border border-[#E7E0D5]"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src !== '/images/cat-3piece.jpg') {
                          target.src = '/images/cat-3piece.jpg';
                        }
                      }}
                    />
                    <div className="min-w-0">
                      <span className="font-mono text-xs font-bold text-[#722F37]">
                        {prod.code}
                      </span>
                      <p className="text-xs font-semibold text-[#1C1917] line-clamp-1">
                        {prod.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-[#78716C] flex-wrap">
                        <span className="font-semibold text-[#722F37]">{prod.category?.name || prod.style_type}</span>
                        <span>•</span>
                        <span>{prod.fabric}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-medium">Ready Stock</span>
                      </div>
                      {sel.notes && (
                        <p className="text-[11px] text-zinc-500 italic mt-0.5">Note: {sel.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right shrink-0">
                    <div>
                      <span className="text-xs font-bold text-[#722F37] block">
                        {prod.price_display_mode === 'show' ? `${formatINR(prod.quoted_price)}/pc` : 'Price on Enquiry'}
                      </span>
                      <span className="text-[10px] text-[#78716C]">
                        MOQ {prod.moq || 6} pcs ratio
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(sel.productId)}
                      className="p-1.5 text-[#A8A29E] hover:text-red-600 transition-colors cursor-pointer"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Sticky Action Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-xs font-semibold text-[#722F37] hover:underline cursor-pointer"
            >
              <span>{isExpanded ? 'Hide Shortlist' : 'View Shortlist'}</span>
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-3 text-xs">
              <div>
                <span className="text-[#78716C]">Designs Shortlisted:</span>{' '}
                <span className="font-bold text-[#1C1917]">{selectedArray.length}</span>
              </div>
              <div className="hidden xs:block text-[#D6CEBE]">|</div>
              <div className="hidden sm:block text-emerald-700 font-semibold">
                Quantities &amp; ratio packs discussed directly on call
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={onOpenWhatsApp}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#25D366] text-white text-xs uppercase tracking-wider font-bold shadow-md hover:bg-[#20ba59] transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 rotate-[-20deg]" />
              <span>Send WhatsApp Inquiry ({selectedArray.length} Designs)</span>
            </button>

            <button
              type="button"
              onClick={onSubmitInquiry}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#E7E0D5] bg-white text-[#1C1917] text-xs uppercase tracking-wider font-bold hover:bg-[#FAF7F2] transition-all cursor-pointer shadow-xs"
            >
              <span>Dispatch Docket Form</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
