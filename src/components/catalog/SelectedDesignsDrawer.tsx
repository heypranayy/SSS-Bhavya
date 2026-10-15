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
}

export function SelectedDesignsDrawer({
  products,
  selections,
  onClearAll,
  onRemoveItem,
  onSubmitInquiry,
}: SelectedDesignsDrawerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const selectedArray = Array.from(selections.values()).filter(s => s.totalQuantity > 0);
  if (selectedArray.length === 0) return null;

  const productMap = new Map(products.map(p => [p.id, p]));

  // Calculate grand totals
  let totalPieces = 0;
  let indicativeTotal = 0;
  let hasMoqIssues = false;

  selectedArray.forEach(sel => {
    const prod = productMap.get(sel.productId);
    if (prod) {
      totalPieces += sel.totalQuantity;
      indicativeTotal += prod.quoted_price * sel.totalQuantity;
      if (sel.totalQuantity < prod.moq) {
        hasMoqIssues = true;
      }
    }
  });

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E7E0D5] shadow-2xl transition-all">
      {/* Expanded Breakdown Drawer */}
      {isExpanded && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 max-h-[50vh] overflow-y-auto border-b border-[#E7E0D5]">
          <div className="flex items-center justify-between pb-3 border-b border-[#F3ECE2]">
            <h4 className="font-serif-luxury font-bold text-sm text-[#1C1917]">
              Review Selected Designs ({selectedArray.length})
            </h4>

            <button
              type="button"
              onClick={onClearAll}
              className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>

          <div className="divide-y divide-[#F3ECE2]">
            {selectedArray.map(sel => {
              const prod = productMap.get(sel.productId);
              if (!prod) return null;
              const subtotal = prod.quoted_price * sel.totalQuantity;

              return (
                <div key={sel.productId} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={prod.images[0]?.image_url}
                      alt=""
                      className="w-12 h-14 object-cover rounded bg-[#EFE9E0]"
                    />
                    <div>
                      <span className="font-mono text-xs font-bold text-[#722F37]">
                        {prod.code}
                      </span>
                      <p className="text-xs font-medium text-[#1C1917] line-clamp-1">
                        {prod.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-[#78716C]">
                        <span>Breakdown:</span>
                        {Object.entries(sel.sizeBreakdown).map(([size, qty]) => (
                          <span key={size} className="bg-[#FAF7F2] border px-1 rounded font-mono text-[10px]">
                            {size}:{qty}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="text-xs font-bold text-[#1C1917] block">
                        {sel.totalQuantity} pcs
                      </span>
                      <span className="text-xs font-extrabold text-[#722F37]">
                        {formatINR(subtotal)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(sel.productId)}
                      className="p-1.5 text-[#A8A29E] hover:text-red-600 transition-colors"
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
              className="flex items-center gap-1 text-xs font-semibold text-[#722F37] hover:underline"
            >
              <span>{isExpanded ? 'Hide Breakdown' : 'View Breakdown'}</span>
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-3 text-xs">
              <div>
                <span className="text-[#78716C]">Designs:</span>{' '}
                <span className="font-bold text-[#1C1917]">{selectedArray.length}</span>
              </div>
              <div className="hidden xs:block text-[#D6CEBE]">|</div>
              <div>
                <span className="text-[#78716C]">Total Quantity:</span>{' '}
                <span className="font-bold text-[#1C1917]">{totalPieces} pcs</span>
              </div>
              <div className="text-[#D6CEBE]">|</div>
              <div>
                <span className="text-[#78716C]">Indicative Total:</span>{' '}
                <span className="font-extrabold text-[#722F37] text-sm">
                  {formatINR(indicativeTotal)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onSubmitInquiry}
              disabled={hasMoqIssues}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#722F37] text-white text-xs uppercase tracking-wider font-bold shadow-md hover:bg-[#5C1D24] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>Submit Wholesale Inquiry ({totalPieces} pcs)</span>
            </button>
          </div>
        </div>

        {hasMoqIssues && (
          <p className="text-[11px] text-amber-700 mt-1 font-medium">
            * Note: One or more selected designs have not met the minimum order quantity (MOQ). Please adjust quantities before submitting.
          </p>
        )}
      </div>
    </div>
  );
}
