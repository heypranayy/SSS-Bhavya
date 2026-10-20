'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Catalog, CatalogProductView } from '@/types';
import { DesignSelector, SelectedItemState } from './DesignSelector';
import { SelectedDesignsDrawer } from './SelectedDesignsDrawer';
import { InquiryModal } from './InquiryModal';
import { WhatsAppSelectionModal } from './WhatsAppSelectionModal';
import { QuickViewModal } from './QuickViewModal';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import {
  Sparkles,
  ShieldCheck,
  PhoneCall,
  Clock,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface PublicCatalogViewProps {
  catalog: Catalog;
  products: CatalogProductView[];
}

export function PublicCatalogView({ catalog, products }: PublicCatalogViewProps) {
  const [selections, setSelections] = useState<Map<string, SelectedItemState>>(new Map());
  const [activeLightboxProduct, setActiveLightboxProduct] = useState<CatalogProductView | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<CatalogProductView | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [submittedRefNo, setSubmittedRefNo] = useState<string | null>(null);

  const settings = catalog.presentation_settings || {
    layout: 'grid',
    columnsDesktop: 3,
    columnsMobile: 1,
    showPrices: true,
    showMoq: true,
    showSizes: true,
    showStockStatus: true,
    showDescription: true,
  };

  const handleItemChange = (productId: string, updated: SelectedItemState | null) => {
    setSelections(prev => {
      const next = new Map(prev);
      if (updated) {
        next.set(productId, updated);
      } else {
        next.delete(productId);
      }
      return next;
    });
  };

  const handleClearAll = () => {
    setSelections(new Map());
  };

  const handleRemoveItem = (productId: string) => {
    setSelections(prev => {
      const next = new Map(prev);
      next.delete(productId);
      return next;
    });
  };

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919830729210';

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] pb-32">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E7E0D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div>
            <Link href="/" className="inline-block">
              <span className="font-serif-luxury text-xl sm:text-2xl font-bold tracking-tight text-[#1C1917]">
                BHAVYA <span className="text-[#722F37] italic font-normal">Fashions</span>
              </span>
            </Link>
            <span className="hidden sm:inline-block text-[10px] uppercase tracking-widest text-[#78716C] ml-3 pl-3 border-l border-[#D6CEBE]">
              Wholesale Private Catalog
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello Bhavya Fashions, I am reviewing catalog "${catalog.title}".`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#25D366] text-white hover:bg-[#20ba59] transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">WhatsApp Assistance</span>
            </a>
          </div>
        </div>
      </header>

      {/* Catalog Hero Banner */}
      <div className="bg-white border-b border-[#E7E0D5] py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {(catalog.cover_image_url || catalog.presentation_settings?.coverImageUrl) && (
            <div className="w-full h-48 sm:h-72 rounded-2xl overflow-hidden mb-6 border border-[#E7E0D5] shadow-xs relative">
              <img
                src={catalog.cover_image_url || catalog.presentation_settings?.coverImageUrl}
                alt={catalog.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            </div>
          )}
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#722F37]/10 text-[#722F37] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Personalized Wholesale Lookbook</span>
            </div>

            <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#1C1917]">
              {catalog.title}
            </h1>

            {catalog.subtitle && (
              <p className="text-sm sm:text-base text-[#78716C] font-light">
                {catalog.subtitle}
              </p>
            )}

            {/* Personalized Greeting */}
            {catalog.customer_greeting && (
              <div className="mt-4 p-4 rounded-xl bg-[#FAF7F2] border border-[#E7E0D5] text-xs sm:text-sm text-[#44403C] space-y-1">
                <p className="font-semibold text-[#722F37]">
                  {catalog.customer_greeting}
                </p>
                {catalog.custom_message && (
                  <p className="text-[#57534E] leading-relaxed">
                    {catalog.custom_message}
                  </p>
                )}
              </div>
            )}

            {/* Catalog Info Badges */}
            <div className="flex items-center gap-4 text-xs text-[#78716C] pt-2 flex-wrap">
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#722F37]" />
                <span className="font-bold text-[#1C1917]">{products.length}</span> Designs Curated
              </span>

              {catalog.expires_at && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Valid until {new Date(catalog.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </span>
              )}

              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Trade Price Quote Locked</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Product Selection List */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif-luxury text-xl font-bold text-[#1C1917]">
            Select Designs for Bulk Procurement
          </h2>

          <div className="text-xs text-[#78716C] hidden sm:block">
            * Tap image to zoom • Enter quantity per size to meet MOQ
          </div>
        </div>

        {/* Product Cards Stack */}
        <div className="space-y-6">
          {products.map((prod) => (
            <DesignSelector
              key={prod.id}
              product={prod}
              selectedState={selections.get(prod.id)}
              onChange={handleItemChange}
              onOpenLightbox={(p) => {
                setActiveLightboxProduct(p);
                setLightboxIndex(0);
              }}
              onQuickView={(p) => setQuickViewProduct(p)}
              allowSizes={settings.showSizes}
              allowQuantity={settings.allowQuantityBreakdown ?? true}
            />
          ))}
        </div>
      </main>

      {/* Floating Selected Designs Drawer */}
      <SelectedDesignsDrawer
        products={products}
        selections={selections}
        onClearAll={handleClearAll}
        onRemoveItem={handleRemoveItem}
        onSubmitInquiry={() => setInquiryModalOpen(true)}
        onOpenWhatsApp={() => setWhatsappModalOpen(true)}
      />

      {/* WhatsApp Selection Review Modal */}
      <WhatsAppSelectionModal
        catalog={catalog}
        products={products}
        selections={selections}
        isOpen={whatsappModalOpen}
        onClose={() => setWhatsappModalOpen(false)}
      />

      {/* Inquiry Submission Modal */}
      <InquiryModal
        catalog={catalog}
        products={products}
        selections={selections}
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        onSuccess={(ref) => {
          setSubmittedRefNo(ref);
        }}
      />

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          selectedState={selections.get(quickViewProduct.id)}
          isOpen={Boolean(quickViewProduct)}
          onClose={() => setQuickViewProduct(null)}
          onSaveSelection={handleItemChange}
          onOpenLightbox={(p) => {
            setActiveLightboxProduct(p);
            setLightboxIndex(0);
          }}
        />
      )}

      {/* Lightbox for Zoom */}
      {activeLightboxProduct && (
        <ImageLightbox
          images={activeLightboxProduct.images}
          currentIndex={lightboxIndex}
          isOpen={Boolean(activeLightboxProduct)}
          onClose={() => setActiveLightboxProduct(null)}
          onNavigate={(idx) => setLightboxIndex(idx)}
        />
      )}
    </div>
  );
}
