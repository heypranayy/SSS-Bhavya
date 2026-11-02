'use client';

import React, { useState } from 'react';
import { Catalog, CatalogProductView } from '@/types';
import {
  FileDown,
  Printer,
  Check,
  X,
  Layers,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  Tag,
  Eye,
} from 'lucide-react';

interface CatalogPdfModalProps {
  catalog: Catalog;
  products: CatalogProductView[];
  isOpen: boolean;
  onClose: () => void;
  options: {
    showPrices: boolean;
    showDescriptions: boolean;
    showCover: boolean;
  };
  setOptions: React.Dispatch<
    React.SetStateAction<{
      showPrices: boolean;
      showDescriptions: boolean;
      showCover: boolean;
    }>
  >;
}

export function CatalogPdfModal({
  catalog,
  products,
  isOpen,
  onClose,
  options,
  setOptions,
}: CatalogPdfModalProps) {
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    setIsExporting(true);
    const originalTitle = document.title;
    const cleanFileName = `${catalog.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Bhavya_Fashions_Lookbook`;
    document.title = cleanFileName;

    // Small delay so options render before triggering print
    setTimeout(() => {
      window.print();
      setIsExporting(false);
      document.title = originalTitle;
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 no-print">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E7E0D5] space-y-5 animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#E7E0D5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#722F37]/10 text-[#722F37] flex items-center justify-center border border-[#722F37]/20">
              <FileDown className="w-5 h-5 text-[#722F37]" />
            </div>
            <div>
              <h3 className="font-serif-luxury text-lg font-bold text-[#1C1917]">
                Download Catalogue as PDF
              </h3>
              <p className="text-xs text-[#78716C]">
                Export complete wholesale lookbook with photography &amp; specifications
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Catalog Summary Card */}
        <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E7E0D5] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1C1917] truncate font-serif-luxury">
              {catalog.title}
            </span>
            <span className="text-[10px] font-mono font-bold bg-[#722F37] text-white px-2 py-0.5 rounded">
              {products.length} Designs
            </span>
          </div>

          <p className="text-[11px] text-[#57534E] leading-relaxed">
            Formatted in high-resolution A4 layout, perfect for sharing over WhatsApp, emailing purchasing teams, or printing physical line sheets.
          </p>

          <div className="pt-2 border-t border-[#E7E0D5]/60 flex items-center gap-4 text-[11px] text-[#78716C] font-mono">
            <span>Layout: <strong>A4 2-Column Grid</strong></span>
            <span>Branding: <strong>Bhavya Fashions</strong></span>
          </div>
        </div>

        {/* Export Options */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-[#1C1917] block">
            Customization Options:
          </span>

          <label className="flex items-center justify-between p-3 rounded-lg border border-[#E7E0D5] hover:bg-[#FAF7F2] cursor-pointer transition-colors">
            <div className="space-y-0.5 pr-2">
              <span className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#722F37]" />
                <span>Include Wholesale Trade Prices</span>
              </span>
              <p className="text-[11px] text-[#78716C]">
                Display exact wholesale rates per piece (+GST). Uncheck to create a blind/unpriced customer lookbook.
              </p>
            </div>
            <input
              type="checkbox"
              checked={options.showPrices}
              onChange={(e) => setOptions((prev) => ({ ...prev, showPrices: e.target.checked }))}
              className="w-4 h-4 rounded text-[#722F37] focus:ring-[#722F37] border-[#C5A059] cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg border border-[#E7E0D5] hover:bg-[#FAF7F2] cursor-pointer transition-colors">
            <div className="space-y-0.5 pr-2">
              <span className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Include Work Highlights &amp; Descriptions</span>
              </span>
              <p className="text-[11px] text-[#78716C]">
                Include detailed embroidery, cut, and fabric details for each design.
              </p>
            </div>
            <input
              type="checkbox"
              checked={options.showDescriptions}
              onChange={(e) => setOptions((prev) => ({ ...prev, showDescriptions: e.target.checked }))}
              className="w-4 h-4 rounded text-[#722F37] focus:ring-[#722F37] border-[#C5A059] cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg border border-[#E7E0D5] hover:bg-[#FAF7F2] cursor-pointer transition-colors">
            <div className="space-y-0.5 pr-2">
              <span className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Include Brand Cover &amp; Dispatch Hub Info</span>
              </span>
              <p className="text-[11px] text-[#78716C]">
                Displays Bhavya Fashions letterhead, order terms, and Kolkata/Surat hub address.
              </p>
            </div>
            <input
              type="checkbox"
              checked={options.showCover}
              onChange={(e) => setOptions((prev) => ({ ...prev, showCover: e.target.checked }))}
              className="w-4 h-4 rounded text-[#722F37] focus:ring-[#722F37] border-[#C5A059] cursor-pointer"
            />
          </label>
        </div>

        {/* Helpful Tip */}
        <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Download Tip:</strong> In your browser&apos;s print dialog that opens, set the Destination to <strong>&ldquo;Save as PDF&rdquo;</strong> (or Microsoft Print to PDF) to save the file directly to your device.
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#722F37] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5C1D24] shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            <Printer className="w-4 h-4 text-[#C5A059]" />
            <span>{isExporting ? 'Preparing PDF...' : 'Download / Save PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
