'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { getProductFallbackImage } from '@/lib/utils';
import { QuickViewModal } from '@/components/ui/QuickViewModal';
import { ProductEnquiryModal } from '@/components/ui/ProductEnquiryModal';
import {
  ArrowRight,
  Eye,
  Layers,
  Sparkles,
  PhoneCall,
  FileText,
  CheckCircle2,
  Filter,
  Check,
} from 'lucide-react';

interface TrendingLookbookProps {
  initialProducts: Product[];
}

interface TabOption {
  id: string;
  label: string;
  tag: string;
}

const TABS: TabOption[] = [
  { id: 'all', label: 'All Designs', tag: 'Complete Catalog' },
  { id: '3-piece', label: '3-Piece Sets (3P)', tag: 'Muslin & Silk Sets' },
  { id: '2-piece', label: '2-Piece Sets (2P)', tag: 'Kurti & Pant Sets' },
  { id: 'coord', label: 'Co-ord Sets', tag: 'Contemporary Tunics' },
  { id: 'anarkali', label: 'Anarkalis & Gowns', tag: 'Flared Kalidar' },
  { id: 'cotton', label: 'Pure Cottons', tag: '60-60 Cambric' },
];

export function TrendingLookbook({ initialProducts }: TrendingLookbookProps) {
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [activeQuickViewProduct, setActiveQuickViewProduct] = useState<Product | null>(null);
  const [activeEnquiryProduct, setActiveEnquiryProduct] = useState<Product | null>(null);

  // Reliable, multi-attribute category filtering that matches actual database and migrated product attributes
  const filteredProducts = useMemo(() => {
    if (selectedTab === 'all') {
      return initialProducts.slice(0, 12);
    }

    const matches = initialProducts.filter((p) => {
      const catId = (p.category_id || '').toLowerCase();
      const catName = (p.category?.name || '').toLowerCase();
      const styleType = (p.style_type || '').toLowerCase();
      const title = (p.title || '').toLowerCase();
      const fabric = (p.fabric || '').toLowerCase();

      if (selectedTab === '3-piece') {
        return (
          catId === 'cat-3p-kurtis' ||
          styleType.includes('3-piece') ||
          styleType.includes('three-piece') ||
          styleType.includes('dupatta') ||
          catName.includes('3-piece') ||
          catName.includes('three-piece') ||
          title.includes('dupatta') ||
          title.includes('3pc') ||
          title.includes('3-piece')
        );
      }

      if (selectedTab === '2-piece') {
        return (
          catId === 'cat-2p-kurtis' ||
          styleType.includes('2-piece') ||
          styleType.includes('two-piece') ||
          catName.includes('2-piece') ||
          catName.includes('two-piece') ||
          title.includes('2pc') ||
          title.includes('2-piece') ||
          (styleType.includes('pant') && !styleType.includes('dupatta'))
        );
      }

      if (selectedTab === 'coord') {
        return (
          catId === 'cat-coord-sets' ||
          styleType.includes('co-ord') ||
          styleType.includes('coord') ||
          catName.includes('co-ord') ||
          title.includes('co-ord') ||
          title.includes('coord')
        );
      }

      if (selectedTab === 'anarkali') {
        return (
          catId === 'cat-gowns' ||
          styleType.includes('anarkali') ||
          styleType.includes('gown') ||
          catName.includes('anarkali') ||
          catName.includes('gown') ||
          title.includes('anarkali') ||
          title.includes('gown')
        );
      }

      if (selectedTab === 'cotton') {
        return (
          catId === 'cat-single-kurtis' ||
          fabric.includes('cotton') ||
          fabric.includes('cambric') ||
          styleType.includes('single') ||
          title.includes('cotton')
        );
      }

      return true;
    });

    return matches.slice(0, 12);
  }, [initialProducts, selectedTab]);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919830729210';

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#FAF6EE] text-[#1C1917] w-full border-b border-[#E7E0D5]">
      <div className="w-full max-w-7xl mx-auto">
        {/* Section Header with Refined Editorial Hierarchy */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#722F37]/10 text-[#722F37] text-xs font-semibold uppercase tracking-widest border border-[#722F37]/15">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Fast-Turnaround Boutique Hits • Quote on Request</span>
            </div>

            <h2 className="font-serif-luxury text-4xl sm:text-5xl md:text-6xl font-bold text-[#1C1917] tracking-tight leading-[1.02]">
              Wholesale <span className="italic text-[#722F37] font-normal">Catalog Highlights</span>
            </h2>

            <p className="text-xs sm:text-base text-[#57534E] font-light max-w-xl leading-relaxed">
              Real inventory direct from Surat looms and Barabazar wholesale depot. All designs available on trade quotation with standard ratio packing.
            </p>
          </div>

          {/* Category Switcher Tabs (Click to swap categories smoothly) */}
          <div className="flex flex-wrap gap-1.5 p-1.5 bg-white/80 backdrop-blur-md border border-[#E7E0D5] rounded-2xl w-fit shadow-xs">
            {TABS.map((tab) => {
              const isActive = selectedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`relative px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-300 focus:outline-none cursor-pointer ${
                    isActive
                      ? 'bg-[#722F37] text-white shadow-md'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/70'
                  }`}
                  aria-pressed={isActive}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter & Current Category Notice */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E7E0D5]/70 text-xs text-zinc-500 mb-8">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#722F37]" />
            <span>
              Showing <strong className="text-zinc-900">{filteredProducts.length}</strong> designs in{' '}
              <span className="font-semibold text-[#722F37]">
                {TABS.find((t) => t.id === selectedTab)?.label}
              </span>
            </span>
          </div>

          <span className="text-[11px] font-mono text-[#8C6D23] uppercase font-bold">
            Verified DN Numbers • Standard Ratio Packing
          </span>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 min-h-[480px]">
          {filteredProducts.map((product) => {
            const fallbackSrc = getProductFallbackImage(product.style_type || product.category?.name);
            const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];
            const imageUrl =
              (primaryImage as any)?.local_url ||
              primaryImage?.image_url ||
              fallbackSrc;

            return (
              <div
                key={product.id}
                className="group relative bg-white border border-[#E7E0D5] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Product Image Area */}
                <div className="relative aspect-[3/4] w-full bg-[#FAF7F2] overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover object-top group-hover:scale-106 transition-transform duration-500 will-change-transform"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== fallbackSrc) {
                        target.src = fallbackSrc;
                      }
                    }}
                  />

                  {/* Gradient shadow for card aesthetics */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Top Badges (Real DN Number) */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
                    <span className="bg-black/85 backdrop-blur-md text-[#C5A059] font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                      {product.code}
                    </span>
                    {product.is_featured && (
                      <span className="bg-[#C5A059] text-white text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-sm uppercase tracking-wider">
                        Trending
                      </span>
                    )}
                  </div>

                  {/* Style Tag */}
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <span className="bg-white/95 backdrop-blur-md text-[#722F37] border border-[#722F37]/20 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                      {product.style_type}
                    </span>
                  </div>

                  {/* Quick View Button (Visible on hover and accessible) */}
                  <button
                    onClick={() => setActiveQuickViewProduct(product)}
                    className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    aria-label={`Quick view design ${product.code} - ${product.title}`}
                  >
                    <span className="bg-white text-zinc-900 text-xs font-bold px-4 py-2.5 rounded-full shadow-xl flex items-center gap-1.5 hover:bg-[#722F37] hover:text-white transition-colors transform translate-y-2 group-hover:translate-y-0 duration-200">
                      <Eye className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>Quick View</span>
                    </span>
                  </button>
                </div>

                {/* Content Area */}
                <div className="p-3.5 sm:p-5 flex flex-col flex-1 justify-between bg-white">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium flex items-center gap-1 line-clamp-1">
                      <span>{product.fabric}</span>
                      <span>•</span>
                      <span>{product.color}</span>
                    </div>

                    <h3 className="font-serif-luxury text-sm sm:text-base font-semibold text-zinc-900 mt-1 line-clamp-1 group-hover:text-[#722F37] transition-colors">
                      {product.title}
                    </h3>
                  </div>

                  {/* Pricing on Request Section (Mandated: All on Quote) */}
                  <div className="mt-3 pt-3 border-t border-[#F3ECE2]">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-[#8C6D23] block font-bold">
                          B2B Trade Pricing
                        </span>
                        <div className="text-xs sm:text-sm font-extrabold text-[#722F37] flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                          <span>Quote on Request</span>
                        </div>
                      </div>

                      <span className="bg-[#FAF7F2] border border-[#E7E0D5] text-zinc-700 text-[10px] font-semibold px-2 py-0.5 rounded">
                        MOQ: {product.moq || 6} pcs
                      </span>
                    </div>

                    {/* Working Action Buttons (Specs, Get Quote, WhatsApp) */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* Specs / Quick View Button */}
                      <button
                        onClick={() => setActiveQuickViewProduct(product)}
                        className="w-full inline-flex items-center justify-center gap-1 py-2 text-[11px] font-semibold rounded-xl bg-[#FAF7F2] text-zinc-800 border border-[#E7E0D5] hover:bg-zinc-100 hover:border-zinc-300 transition-colors shadow-2xs cursor-pointer"
                        title="View Full Specifications"
                      >
                        <Layers className="w-3 h-3 text-[#722F37]" />
                        <span>Specs</span>
                      </button>

                      {/* Request Official Quote Button */}
                      <button
                        onClick={() => setActiveEnquiryProduct(product)}
                        className="w-full inline-flex items-center justify-center gap-1 py-2 text-[11px] font-bold rounded-xl bg-[#722F37] text-white hover:bg-[#58111A] transition-colors shadow-2xs cursor-pointer"
                        title="Submit Price Request"
                      >
                        <FileText className="w-3 h-3 text-[#C5A059]" />
                        <span>Get Quote</span>
                      </button>
                    </div>

                    {/* WhatsApp Fast-Track Inquiry Action */}
                    <a
                      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                        `Hello Bhavya Fashions, I am requesting quotation and live MOQ stock for design: ${product.code} - ${product.title} (${product.style_type}, ${product.fabric}).`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 w-full inline-flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-bold rounded-xl bg-[#25D366]/10 text-emerald-800 border border-emerald-300 hover:bg-[#25D366] hover:text-white transition-all shadow-2xs"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>WhatsApp Quote</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All In Explorer CTA Footer */}
        <div className="mt-14 text-center">
          <Link
            href="/wholesale#explorer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#722F37] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg hover:bg-[#58111A] hover:scale-105 transition-all duration-200"
          >
            <span>Explore Complete Wholesale Catalog (70+ Real Designs)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Working Quick View Modal (For Specs & Gallery) */}
      <QuickViewModal
        product={activeQuickViewProduct}
        onClose={() => setActiveQuickViewProduct(null)}
        priceModeOverride="request"
      />

      {/* Working Product Enquiry Modal (For Submitting Quote Requests with BF-REQ-XXXXX) */}
      <ProductEnquiryModal
        product={activeEnquiryProduct}
        isOpen={Boolean(activeEnquiryProduct)}
        onClose={() => setActiveEnquiryProduct(null)}
        sourcePage="homepage"
      />
    </section>
  );
}
