'use client';

import React from 'react';
import { Catalog, CatalogProductView } from '@/types';
import { formatINR } from '@/lib/utils';

interface CatalogPrintLayoutProps {
  catalog: Catalog;
  products: CatalogProductView[];
  options?: {
    showPrices?: boolean;
    showDescriptions?: boolean;
    showCover?: boolean;
  };
}

export function CatalogPrintLayout({
  catalog,
  products,
  options = {},
}: CatalogPrintLayoutProps) {
  const showPrices = options.showPrices ?? true;
  const showDescriptions = options.showDescriptions ?? true;
  const showCover = options.showCover ?? true;

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="print-only hidden print:block text-[#1C1917] bg-white font-sans">
      {/* Embedded Print CSS to guarantee clean A4 page breaks, margins, and exact colors */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media screen {
          .print-only {
            display: none !important;
          }
        }
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 10mm 12mm 10mm;
          }
          html, body {
            background-color: #ffffff !important;
            color: #1C1917 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .print-break-inside-avoid {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .print-page-break-after {
            page-break-after: always !important;
            break-after: page !important;
          }
        }
      `}} />

      {/* Cover / Lookbook Header Banner */}
      {showCover && (
        <div className="border-b-2 border-[#722F37] pb-6 mb-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="text-2xl font-serif font-black tracking-tight text-[#1C1917]">
                BHAVYA <span className="text-[#722F37] italic font-normal">Fashions</span>
              </div>
              <div className="text-[10px] tracking-widest uppercase font-mono text-[#8C6D23] font-bold mt-0.5">
                Wholesale Kurti Manufacturer & Loom Exporter
              </div>
              <div className="text-[10px] text-zinc-600 mt-1 space-y-0.5">
                <div>5, Shiv Thakur Lane, Barabazar, Kolkata — 700007 | Surat Loom Hub</div>
                <div>WhatsApp / Desk: +91 98307 29210 | Email: wholesale@bhavyafashions.com</div>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-[#722F37] text-white text-[10px] font-mono uppercase font-bold tracking-wider rounded">
                Official B2B Lookbook
              </span>
              <div className="text-[11px] text-zinc-600 mt-1 font-mono">
                Date: {todayFormatted}
              </div>
              {catalog.expires_at && (
                <div className="text-[10px] text-amber-900 font-semibold font-mono">
                  Valid Until: {new Date(catalog.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-200">
            <h1 className="text-xl font-serif font-bold text-[#1C1917]">
              {catalog.title}
            </h1>
            {catalog.subtitle && (
              <p className="text-xs text-zinc-600 mt-0.5 italic">
                {catalog.subtitle}
              </p>
            )}

            {catalog.customer_greeting && (
              <div className="mt-2 p-2.5 rounded bg-zinc-50 border border-zinc-200 text-xs">
                <span className="font-bold text-[#722F37] block">
                  {catalog.customer_greeting}
                </span>
                {catalog.custom_message && (
                  <p className="text-zinc-600 text-[11px] mt-0.5 leading-relaxed">
                    {catalog.custom_message}
                  </p>
                )}
              </div>
            )}

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-600 font-mono">
              <span>Total Curated Designs: <strong>{products.length} Items</strong></span>
              <span>Pricing: <strong>{showPrices ? 'Trade Prices Locked (+5% GST)' : 'Price on Enquiry'}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Product Catalog Grid: 2-columns optimized for A4 page width and height */}
      <div className="grid grid-cols-2 gap-4">
        {products.map((prod, idx) => {
          const imgUrl = prod.images?.[0]?.image_url || '/placeholder.png';
          const hasPrice = showPrices && prod.price_display_mode !== 'request' && (prod.quoted_price || prod.base_wholesale_price);

          return (
            <div
              key={prod.id || idx}
              className="print-break-inside-avoid border border-zinc-300 rounded-lg p-3 bg-white flex flex-col justify-between"
              style={{ minHeight: '340px' }}
            >
              <div>
                {/* Header Row: Product Code & Price */}
                <div className="flex items-center justify-between gap-2 border-b border-zinc-200 pb-2 mb-2">
                  <span className="font-mono text-xs font-black px-2 py-0.5 bg-[#FAF7F2] text-[#722F37] border border-[#E7E0D5] rounded">
                    {prod.code}
                  </span>

                  {hasPrice ? (
                    <div className="text-right">
                      <span className="text-sm font-black text-[#722F37]">
                        {formatINR(prod.quoted_price || prod.base_wholesale_price)}
                      </span>
                      <span className="text-[10px] text-zinc-500 ml-1">/ pc (+GST)</span>
                    </div>
                  ) : (
                    <span className="text-[11px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Price on Enquiry
                    </span>
                  )}
                </div>

                {/* Product Image & Main Details */}
                <div className="flex gap-3">
                  {/* Photo Thumbnail */}
                  <div className="w-28 h-36 shrink-0 rounded overflow-hidden border border-zinc-200 bg-zinc-50">
                    <img
                      src={imgUrl}
                      alt={prod.title}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>

                  {/* Specifications */}
                  <div className="flex-1 min-w-0 space-y-1.5 text-xs">
                    <h3 className="font-bold text-[#1C1917] leading-snug line-clamp-2">
                      {prod.title}
                    </h3>

                    {prod.fabric && (
                      <div className="text-[11px]">
                        <span className="text-zinc-500 font-medium">Fabric: </span>
                        <span className="font-semibold text-zinc-900">{prod.fabric}</span>
                      </div>
                    )}

                    {prod.color && (
                      <div className="text-[11px]">
                        <span className="text-zinc-500 font-medium">Color: </span>
                        <span className="font-semibold text-zinc-900">{prod.color}</span>
                      </div>
                    )}

                    <div className="text-[11px]">
                      <span className="text-zinc-500 font-medium">MOQ: </span>
                      <span className="font-semibold text-zinc-900">{prod.moq || 6} pcs per design</span>
                    </div>

                    <div className="text-[11px]">
                      <span className="text-zinc-500 font-medium">Sizes: </span>
                      <span className="font-mono font-semibold text-zinc-900">M, L, XL, XXL (Set Wise)</span>
                    </div>

                    {showDescriptions && prod.description && (
                      <p className="text-[10px] text-zinc-600 mt-1 line-clamp-2 italic leading-relaxed">
                        {prod.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Bar */}
              <div className="mt-2 pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                <span>Direct Loom Trade</span>
                <span>Ref: #{idx + 1}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Wholesale Ordering Instructions & Footer */}
      <div className="print-break-inside-avoid mt-8 pt-4 border-t-2 border-[#722F37] space-y-2 text-xs">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="font-bold text-[#722F37] uppercase tracking-wider text-[11px] block">
              How to Place an Order from this Catalogue:
            </span>
            <p className="text-zinc-600 text-[11px] mt-0.5 leading-relaxed">
              1. Note down your selected Product Codes (e.g. {products[0]?.code || 'BF-3PC-105'}) along with required quantities.<br />
              2. Send directly on WhatsApp to <strong>+91 98307 29210</strong> or email <strong>wholesale@bhavyafashions.com</strong>.<br />
              3. Our desk will issue a formal GST Proforma Invoice &amp; dispatch tracking details immediately.
            </p>
          </div>

          <div className="text-right shrink-0 font-mono text-[10px] text-zinc-500 space-y-0.5">
            <div>Dispatch: Within 24-48 Hours</div>
            <div>Payment: RTGS / NEFT / Bank Transfer</div>
            <div>GST: 5% Extra on Apparel</div>
          </div>
        </div>

        <div className="pt-2 text-center text-[10px] text-zinc-400 font-mono border-t border-zinc-200">
          © {new Date().getFullYear()} Bhavya Fashions — All Rights Reserved. Private Trade Catalogue.
        </div>
      </div>
    </div>
  );
}
