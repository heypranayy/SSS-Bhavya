'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Collection, Product } from '@/types';
import { ProductCard } from '@/components/ui/ProductCard';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { formatINR } from '@/lib/utils';
import {
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  ArrowUpDown,
  ShoppingBag,
  Send,
  PhoneCall,
  Trash2,
  X,
  Plus,
  Minus,
  CheckCircle2,
} from 'lucide-react';

interface CollectionFilterViewProps {
  collection: Collection;
  products: Product[];
}

export function CollectionFilterView({ collection, products }: CollectionFilterViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFabric, setSelectedFabric] = useState<string>('all');
  const [selectedPriceMax, setSelectedPriceMax] = useState<number>(1500);
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'code'>('newest');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // WhatsApp Cart State
  const [cart, setCart] = useState<Map<string, { product: Product; sets: number; totalQuantity: number }>>(new Map());
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919830729210';

  const toggleAddToCart = (product: Product) => {
    setCart((prev) => {
      const next = new Map(prev);
      if (next.has(product.id)) {
        next.delete(product.id);
      } else {
        const moq = product.moq || 6;
        next.set(product.id, { product, sets: 1, totalQuantity: moq });
      }
      return next;
    });
  };

  const updateCartSets = (productId: string, delta: number) => {
    setCart((prev) => {
      const next = new Map(prev);
      const existing = next.get(productId);
      if (!existing) return prev;
      const newSets = existing.sets + delta;
      if (newSets <= 0) {
        next.delete(productId);
      } else {
        const moq = existing.product.moq || 6;
        next.set(productId, {
          ...existing,
          sets: newSets,
          totalQuantity: newSets * moq,
        });
      }
      return next;
    });
  };

  const cartItems = Array.from(cart.values());
  const totalPiecesInCart = cartItems.reduce((acc, item) => acc + item.totalQuantity, 0);
  const totalAmountInCart = cartItems.reduce((acc, item) => acc + (item.product.base_wholesale_price * item.totalQuantity), 0);

  const generateWhatsAppMessage = () => {
    const lines = cartItems.map((item, idx) => {
      const p = item.product;
      const priceText = p.base_wholesale_price ? `₹${p.base_wholesale_price}/pc` : 'Price on Enquiry';
      return `${idx + 1}. Design: ${p.code} (${p.title})\n` +
        `   • Category: ${p.category?.name || p.style_type}\n` +
        `   • Cloth Type / Fabric: ${p.fabric}\n` +
        `   • Quantity: ${item.sets} Set (${item.totalQuantity} pcs ratio pack)\n` +
        `   • Quoted Trade Price: ${priceText}`;
    }).join('\n\n');

    return encodeURIComponent(
      `Hello Bhavya Fashions,\n\nI am interested in ordering the following wholesale designs from your collection "${collection.name}":\n\n${lines}\n\nTotal Designs: ${cartItems.length}\nTotal Pieces: ${totalPiecesInCart} pcs\nIndicative Subtotal: ₹${totalAmountInCart.toLocaleString('en-IN')}\n\nPlease confirm stock availability and dispatch schedule.`
    );
  };

  const whatsappInquiryUrl = `https://wa.me/${whatsappNumber}?text=${generateWhatsAppMessage()}`;

  // Lightbox state
  const [activeLightboxProduct, setActiveLightboxProduct] = useState<Product | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Extract unique filter options from products
  const fabrics = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => { if (p.fabric) set.add(p.fabric); });
    return Array.from(set);
  }, [products]);

  const styles = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => { if (p.style_type) set.add(p.style_type); });
    return Array.from(set);
  }, [products]);

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = p.code.toLowerCase().includes(q);
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesFabric = p.fabric.toLowerCase().includes(q);
        if (!matchesCode && !matchesTitle && !matchesFabric) return false;
      }

      // Fabric
      if (selectedFabric !== 'all' && p.fabric !== selectedFabric) {
        return false;
      }

      // Style
      if (selectedStyle !== 'all' && p.style_type !== selectedStyle) {
        return false;
      }

      // Price Max
      if (p.base_wholesale_price > selectedPriceMax) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.base_wholesale_price - b.base_wholesale_price;
      if (sortBy === 'price_desc') return b.base_wholesale_price - a.base_wholesale_price;
      if (sortBy === 'code') return a.code.localeCompare(b.code);
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
    });
  }, [products, searchQuery, selectedFabric, selectedStyle, selectedPriceMax, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedFabric('all');
    setSelectedStyle('all');
    setSelectedPriceMax(1500);
    setSortBy('newest');
  };

  const hasActiveFilters = searchQuery !== '' || selectedFabric !== 'all' || selectedStyle !== 'all' || selectedPriceMax < 1500;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb & Collection Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-[#78716C] mb-2">
          <Link href="/" className="hover:text-[#722F37]">Home</Link>
          <span>/</span>
          <Link href="/collections" className="hover:text-[#722F37]">Collections</Link>
          <span>/</span>
          <span className="text-[#1C1917] font-semibold">{collection.name}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#1C1917]">
              {collection.name}
            </h1>
            <p className="text-sm text-[#78716C] mt-1 max-w-2xl">
              {collection.description}
            </p>
          </div>

          <div className="text-xs text-[#78716C]">
            Showing <span className="font-bold text-[#1C1917]">{filteredProducts.length}</span> of {products.length} wholesale designs
          </div>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E0D5] shadow-xs mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product code (e.g. BF-3PC) or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
          />
        </div>

        {/* Desktop Quick Dropdowns */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Fabric Filter */}
          <select
            value={selectedFabric}
            onChange={(e) => setSelectedFabric(e.target.value)}
            className="text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
          >
            <option value="all">All Fabrics</option>
            {fabrics.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          {/* Style Filter */}
          <select
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
            className="text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
          >
            <option value="all">All Cut Styles</option>
            {styles.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-[#E7E0D5]">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#78716C]" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="code">Product Code</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="p-2 text-xs text-[#722F37] hover:bg-[#FAF7F2] rounded-lg flex items-center gap-1"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Mobile Filter Toggle Button */}
        <div className="flex lg:hidden items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg bg-[#FAF7F2] border border-[#E7E0D5] text-[#1C1917]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#722F37]" />
            <span>Filter & Sort {hasActiveFilters ? '(Active)' : ''}</span>
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="p-2 text-xs text-[#722F37] rounded-lg border border-[#E7E0D5]"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E0D5]">
              <h3 className="font-serif-luxury text-base font-bold text-[#1C1917]">
                Filter & Sort Designs
              </h3>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="text-xs font-bold text-[#722F37] uppercase tracking-wider"
              >
                Done
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">Fabric</label>
                <select
                  value={selectedFabric}
                  onChange={(e) => setSelectedFabric(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2]"
                >
                  <option value="all">All Fabrics</option>
                  {fabrics.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">Silhouette Style</label>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2]"
                >
                  <option value="all">All Cut Styles</option>
                  {styles.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">Sort Order</label>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2]"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="code">Product Code</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E7E0D5] flex gap-3">
              <button
                type="button"
                onClick={resetFilters}
                className="flex-1 py-2 text-xs font-semibold text-[#78716C] border rounded-lg"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-2 text-xs font-bold text-white bg-[#722F37] rounded-lg uppercase tracking-wider"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E7E0D5] p-12 text-center max-w-md mx-auto space-y-4 my-8">
          <div className="w-12 h-12 rounded-full bg-[#FAF7F2] text-[#722F37] flex items-center justify-center mx-auto">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="font-serif-luxury text-lg font-bold text-[#1C1917]">
            No matching designs found
          </h3>
          <p className="text-xs text-[#78716C]">
            Try adjusting your search query or reset fabric and price filters to see available stock.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 rounded-lg bg-[#722F37] text-white text-xs font-semibold uppercase tracking-wider"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pb-16">
          {filteredProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onQuickView={(p) => {
                setActiveLightboxProduct(p);
                setLightboxIndex(0);
              }}
              onAddToCart={toggleAddToCart}
              isInCart={cart.has(prod.id)}
            />
          ))}
        </div>
      )}

      {/* Floating Selected Products Bar for WhatsApp Cart */}
      {cartItems.length > 0 && (
        <aside
          aria-label="Collection WhatsApp Cart"
          className="fixed bottom-0 left-0 right-0 z-50 bg-[#1C1215]/95 backdrop-blur-md border-t border-[#C5A059]/40 py-3 px-4 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-[#C5A059] text-[#1C1215] font-bold text-xs flex items-center justify-center font-mono">
                {cartItems.length}
              </span>
              <div>
                <span className="text-xs sm:text-sm font-bold text-white block">
                  {cartItems.length} {cartItems.length === 1 ? 'Design' : 'Designs'} in WhatsApp Cart ({totalPiecesInCart} pcs)
                </span>
                <span className="text-[10px] text-zinc-400 hidden sm:inline">
                  Subtotal: {formatINR(totalAmountInCart)} • Ready to send to Bhavya Fashions WhatsApp
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCartDrawerOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Review Items
              </button>

              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#20ba59] transition-all shadow-md"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Send on WhatsApp</span>
              </a>
            </div>
          </div>
        </aside>
      )}

      {/* Cart Review Sheet Drawer */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setCartDrawerOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-hidden">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#E7E0D5] bg-[#FAF7F2] shrink-0">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#722F37] font-bold">
                  {collection.name}
                </span>
                <h3 className="font-serif-luxury text-base font-bold text-[#1C1917]">
                  WhatsApp Cart ({cartItems.length} Designs)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCartDrawerOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selected Products List */}
            <div className="p-4 overflow-y-auto divide-y divide-[#F3ECE2] flex-1">
              {cartItems.map((item) => {
                const prod = item.product;
                const subtotal = prod.base_wholesale_price * item.totalQuantity;
                return (
                  <div key={prod.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={(prod.images[0] as any)?.local_url || prod.images[0]?.image_url || '/images/cat-3piece.jpg'}
                        alt=""
                        className="w-12 h-14 object-cover rounded bg-[#EFE9E0] shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = '/images/cat-3piece.jpg';
                        }}
                      />
                      <div className="min-w-0">
                        <span className="font-mono font-bold text-[#722F37] bg-[#FAF7F2] px-1.5 py-0.5 rounded border border-[#E7E0D5] text-[10px]">
                          {prod.code}
                        </span>
                        <p className="text-[#1C1917] font-semibold truncate mt-0.5">{prod.title}</p>
                        <div className="text-[11px] text-[#78716C] mt-0.5 flex items-center gap-1.5">
                          <span>{prod.fabric}</span>
                          <span>•</span>
                          <span className="font-mono text-zinc-800">{item.sets} Set ({item.totalQuantity} pcs)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center border border-[#E7E0D5] rounded-lg bg-white overflow-hidden shadow-2xs">
                        <button
                          type="button"
                          onClick={() => updateCartSets(prod.id, -1)}
                          className="w-6 h-6 flex items-center justify-center text-zinc-700 hover:bg-zinc-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-mono font-bold">{item.sets}</span>
                        <button
                          type="button"
                          onClick={() => updateCartSets(prod.id, 1)}
                          className="w-6 h-6 flex items-center justify-center bg-[#722F37] text-white hover:bg-[#58111A]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleAddToCart(prod)}
                        className="p-1.5 text-zinc-400 hover:text-red-600 transition-colors"
                        title="Remove design"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-[#FAF7F2] border-t border-[#E7E0D5] space-y-3 shrink-0">
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-[#78716C]">Total Quantity:</span>
                <span className="font-bold text-[#1C1917]">{totalPiecesInCart} pcs</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-[#78716C]">Indicative Subtotal:</span>
                <span className="font-serif-luxury text-base font-bold text-[#722F37]">
                  {formatINR(totalAmountInCart)}
                </span>
              </div>

              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#20ba59] shadow-md transition-all"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Send {cartItems.length} Designs on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox for Quick View */}
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
