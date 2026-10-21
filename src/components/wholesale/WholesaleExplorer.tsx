'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Product, Category, Collection, PriceDisplayMode } from '@/types';
import { formatINR, getProductFallbackImage } from '@/lib/utils';
import { resolvePriceDisplayMode } from '@/lib/utils/price-policy';
import { QuickViewModal } from '@/components/ui/QuickViewModal';
import { ProductEnquiryModal } from '@/components/ui/ProductEnquiryModal';
import {
  Search,
  SlidersHorizontal,
  X,
  Check,
  Plus,
  Eye,
  Layers,
  PhoneCall,
  Sparkles,
  ArrowUpDown,
  Filter,
  FileText,
  ChevronDown,
  RotateCcw,
  MessageCircle,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

interface WholesaleExplorerProps {
  products: Product[];
  categories: Category[];
  collections: Collection[];
  globalPriceMode?: PriceDisplayMode;
}

interface SelectedItem {
  product: Product;
  sizeBreakdown: Record<string, number>;
  totalQuantity: number;
  notes?: string;
}

export function WholesaleExplorer({
  products,
  categories,
  collections,
  globalPriceMode = 'show',
}: WholesaleExplorerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search & Filters State initialized from URL query params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedCollection, setSelectedCollection] = useState(searchParams.get('collection') || 'all');
  const [selectedSize, setSelectedSize] = useState(searchParams.get('size') || 'all');
  const [selectedFabric, setSelectedFabric] = useState(searchParams.get('fabric') || 'all');
  const [maxPrice, setMaxPrice] = useState<number>(Number(searchParams.get('maxPrice')) || 1500);
  const [onlyInStock, setOnlyInStock] = useState(searchParams.get('inStock') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');

  // Modals and Drawers
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [activeQuickViewProduct, setActiveQuickViewProduct] = useState<Product | null>(null);
  const [activeEnquiryProduct, setActiveEnquiryProduct] = useState<Product | null>(null);
  const [selectionDrawerOpen, setSelectionDrawerOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Map<string, SelectedItem>>(new Map());

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919830729210';

  // Synchronize state when URL parameters change
  useEffect(() => {
    const qCat = searchParams.get('category');
    const qCol = searchParams.get('collection');
    const qSize = searchParams.get('size');
    const qFabric = searchParams.get('fabric');
    const qSearch = searchParams.get('search');
    const qInStock = searchParams.get('inStock');
    const qSort = searchParams.get('sort');

    setSelectedCategory(qCat || 'all');
    setSelectedCollection(qCol || 'all');
    setSelectedSize(qSize || 'all');
    setSelectedFabric(qFabric || 'all');
    if (qSearch !== null) setSearchQuery(qSearch);
    if (qInStock !== null) setOnlyInStock(qInStock === 'true');
    if (qSort !== null) setSortBy(qSort);
  }, [searchParams]);

  // Synchronize state with URL parameters
  const updateUrlParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'all') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.replace(`/wholesale?${params.toString()}`, { scroll: false });
  };

  // Distinct fabrics for filter
  const availableFabrics = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.fabric) set.add(p.fabric.trim());
    });
    return Array.from(set).slice(0, 8);
  }, [products]);

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Search Query: Matches Title, Code/DN, Fabric, Color
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchCode = p.code.toLowerCase().includes(q);
        const matchFabric = (p.fabric || '').toLowerCase().includes(q);
        const matchColor = (p.color || '').toLowerCase().includes(q);
        const matchDesc = (p.description || '').toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchFabric && !matchColor && !matchDesc) {
          return false;
        }
      }

      // 2. Category Filter
      if (selectedCategory !== 'all') {
        const catName = (p.category?.name || '').toLowerCase();
        const catSlug = (p.category?.slug || '').toLowerCase();
        const catId = (p.category_id || p.category?.id || '').toLowerCase();
        const style = (p.style_type || '').toLowerCase();
        const sel = selectedCategory.toLowerCase();

        let matchCategory =
          catName.includes(sel) ||
          catSlug.includes(sel) ||
          catId === sel ||
          style.includes(sel);

        // Handle common wholesale aliases
        if (!matchCategory) {
          if (sel.includes('3-piece') || sel.includes('three-piece') || sel.includes('3p')) {
            matchCategory = style.includes('3-piece') || catSlug.includes('3-piece') || catName.includes('three-piece') || style.includes('dupatta');
          } else if (sel.includes('2-piece') || sel.includes('two-piece') || sel.includes('2p')) {
            matchCategory = style.includes('2-piece') || catSlug.includes('2-piece') || catName.includes('two-piece');
          } else if (sel.includes('coord') || sel.includes('co-ord')) {
            matchCategory = style.includes('co-ord') || catSlug.includes('coord') || catName.includes('co-ord');
          } else if (sel.includes('anarkali') || sel.includes('gown')) {
            matchCategory = style.includes('anarkali') || catSlug.includes('gowns') || catName.includes('anarkali');
          }
        }

        if (!matchCategory) return false;
      }

      // 3. Collection Filter
      if (selectedCollection !== 'all') {
        const colSel = selectedCollection.toLowerCase();
        let hasCollection = p.collections?.some(
          (c) =>
            c.slug?.toLowerCase() === colSel ||
            c.id?.toLowerCase() === colSel ||
            c.name?.toLowerCase()?.includes(colSel)
        );

        // Resilient fallback matching if p.collections is unpopulated or uses aliases
        if (!hasCollection) {
          const style = (p.style_type || '').toLowerCase();
          const catSlug = (p.category?.slug || '').toLowerCase();
          const catName = (p.category?.name || '').toLowerCase();
          const catId = (p.category_id || p.category?.id || '').toLowerCase();
          const title = p.title.toLowerCase();

          if (colSel.includes('3-piece') || colSel.includes('three-piece') || colSel.includes('3p')) {
            hasCollection =
              style.includes('3-piece') ||
              catSlug.includes('3-piece') ||
              catName.includes('three-piece') ||
              style.includes('dupatta') ||
              title.includes('3 piece') ||
              title.includes('3-piece') ||
              title.includes('dupatta');
          } else if (colSel.includes('2-piece') || colSel.includes('two-piece') || colSel.includes('2p')) {
            hasCollection =
              style.includes('2-piece') ||
              catSlug.includes('2-piece') ||
              catName.includes('two-piece') ||
              title.includes('2 piece') ||
              title.includes('2-piece');
          } else if (colSel.includes('coord') || colSel.includes('co-ord')) {
            hasCollection =
              style.includes('co-ord') ||
              catSlug.includes('coord') ||
              catName.includes('co-ord') ||
              title.includes('coord') ||
              title.includes('co-ord');
          } else if (colSel.includes('anarkali') || colSel.includes('gown')) {
            hasCollection =
              style.includes('anarkali') ||
              catSlug.includes('gowns') ||
              catName.includes('anarkali') ||
              title.includes('anarkali') ||
              title.includes('gown');
          } else if (colSel.includes('single') || colSel.includes('kurti')) {
            hasCollection =
              style.includes('single') ||
              catSlug.includes('kurti') ||
              catName.includes('single') ||
              title.includes('single') ||
              title.includes('kurti');
          } else if (colSel.includes('western') || colSel.includes('midi')) {
            hasCollection =
              style.includes('western') ||
              catSlug.includes('western') ||
              catName.includes('western') ||
              title.includes('midi');
          } else {
            hasCollection = catSlug.includes(colSel) || catName.includes(colSel) || catId === colSel;
          }
        }

        if (!hasCollection) return false;
      }

      // 4. Size Filter
      if (selectedSize !== 'all') {
        const hasSize = p.variants?.some(
          (v) => v.size.toUpperCase() === selectedSize.toUpperCase()
        );
        if (!hasSize) return false;
      }

      // 5. Fabric Filter
      if (selectedFabric !== 'all') {
        if (!p.fabric || !p.fabric.toLowerCase().includes(selectedFabric.toLowerCase())) {
          return false;
        }
      }

      // 6. Max Price
      if (p.base_wholesale_price > 0 && p.base_wholesale_price > maxPrice) {
        return false;
      }

      // 7. Availability
      if (onlyInStock && p.stock_status !== 'in_stock') {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.base_wholesale_price - b.base_wholesale_price;
      if (sortBy === 'price-desc') return b.base_wholesale_price - a.base_wholesale_price;
      if (sortBy === 'code') return a.code.localeCompare(b.code);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedCollection,
    selectedSize,
    selectedFabric,
    maxPrice,
    onlyInStock,
    sortBy,
  ]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedCollection('all');
    setSelectedSize('all');
    setSelectedFabric('all');
    setMaxPrice(1500);
    setOnlyInStock(false);
    setSortBy('newest');
    router.replace('/wholesale', { scroll: false });
  };

  // Selection Management
  const toggleProductSelection = (product: Product) => {
    setSelectedItems((prev) => {
      const next = new Map(prev);
      if (next.has(product.id)) {
        next.delete(product.id);
      } else {
        // default size breakdown with standard MOQ ratio
        const breakdown: Record<string, number> = {};
        if (product.variants?.length > 0) {
          product.variants.forEach((v) => {
            breakdown[v.size] = 2; // e.g. 2 of each
          });
        }
        next.set(product.id, {
          product,
          sizeBreakdown: breakdown,
          totalQuantity: product.moq || 6,
        });
      }
      return next;
    });
  };

  const updateItemQuantity = (productId: string, size: string, qty: number) => {
    setSelectedItems((prev) => {
      const next = new Map(prev);
      const item = next.get(productId);
      if (!item) return prev;

      const newBreakdown = { ...item.sizeBreakdown, [size]: Math.max(0, qty) };
      const newTotal = Object.values(newBreakdown).reduce((a, b) => a + b, 0);

      next.set(productId, {
        ...item,
        sizeBreakdown: newBreakdown,
        totalQuantity: Math.max(item.product.moq || 6, newTotal),
      });
      return next;
    });
  };

  const removeSelectedItem = (productId: string) => {
    setSelectedItems((prev) => {
      const next = new Map(prev);
      next.delete(productId);
      return next;
    });
  };

  // WhatsApp Selection Message Generator
  const generateWhatsAppMessage = () => {
    const items = Array.from(selectedItems.values());
    if (items.length === 0) return '';

    const lines: string[] = [];
    items.forEach((item, idx) => {
      const prod = item.product;
      const sizeEntries = Object.entries(item.sizeBreakdown).filter(([_, q]) => q > 0);

      if (sizeEntries.length > 0) {
        const sizeStr = sizeEntries.map(([s, q]) => `${s}: ${q}`).join(', ');
        lines.push(`${idx + 1}. DN: ${prod.code} — ${prod.title}\n   Sizes & Qty: [${sizeStr}] (Total: ${item.totalQuantity} pcs)`);
      } else {
        lines.push(`${idx + 1}. DN: ${prod.code} — ${prod.title} (Quantity: ${item.totalQuantity} pcs)`);
      }
    });

    return `Hello Bhavya Fashions,

I am interested in the following wholesale designs from your Bhavya Fashions collection:

${lines.join('\n\n')}

Source: Bhavya Fashions Wholesale Explorer
Please confirm live warehouse availability, size ratio stock, and applicable wholesale trade pricing.`;
  };

  const selectedCount = selectedItems.size;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(generateWhatsAppMessage())}`;

  return (
    <div id="explorer" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#E7E0D5] p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                updateUrlParams({ search: e.target.value });
              }}
              placeholder="Search by DN code (e.g. DN11059), fabric, color, or style..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] text-xs sm:text-sm rounded-xl border border-[#E7E0D5] focus:bg-white focus:outline-none focus:border-[#722F37]"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  updateUrlParams({ search: null });
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative shrink-0">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  updateUrlParams({ sort: e.target.value });
                }}
                className="appearance-none bg-[#FAF7F2] border border-[#E7E0D5] text-xs font-semibold text-zinc-800 py-2.5 pl-3.5 pr-8 rounded-xl focus:outline-none cursor-pointer"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="price-asc">Sort: Price Low to High</option>
                <option value="price-desc">Sort: Price High to Low</option>
                <option value="code">Sort: Product Code / DN</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="md:hidden inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#722F37] text-white text-xs font-bold rounded-xl"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Desktop Quick Category Filter Pills */}
        <div className="hidden md:flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-t border-[#F3ECE2] pt-3">
          <span className="text-[11px] font-mono uppercase text-zinc-400 mr-2 shrink-0">Category:</span>
          <button
            onClick={() => {
              setSelectedCategory('all');
              updateUrlParams({ category: null });
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#1C1917] text-white shadow-xs'
                : 'bg-[#FAF7F2] text-zinc-600 hover:bg-zinc-200/60'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => {
            const isActive = selectedCategory.toLowerCase() === cat.name.toLowerCase() || selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  const val = isActive ? 'all' : cat.name;
                  setSelectedCategory(val);
                  updateUrlParams({ category: val === 'all' ? null : val });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#722F37] text-white shadow-xs'
                    : 'bg-[#FAF7F2] text-zinc-600 hover:bg-zinc-200/60'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Desktop Quick Collection Filter Pills */}
        {collections && collections.length > 0 && (
          <div className="hidden md:flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-t border-[#F3ECE2] pt-2.5">
            <span className="text-[11px] font-mono uppercase text-[#722F37] font-bold mr-2 shrink-0">Collection:</span>
            <button
              onClick={() => {
                setSelectedCollection('all');
                updateUrlParams({ collection: null });
              }}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                selectedCollection === 'all'
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-zinc-600 hover:bg-zinc-200/60'
              }`}
            >
              All Series
            </button>
            {collections.map((col) => {
              const isActive = selectedCollection.toLowerCase() === col.slug.toLowerCase() || selectedCollection.toLowerCase() === col.id.toLowerCase();
              return (
                <button
                  key={col.id}
                  onClick={() => {
                    const val = isActive ? 'all' : col.slug;
                    setSelectedCollection(val);
                    updateUrlParams({ collection: val === 'all' ? null : val });
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#C5A059] text-white shadow-xs font-bold'
                      : 'bg-[#FAF7F2] text-zinc-600 hover:bg-zinc-200/60'
                  }`}
                >
                  {col.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Secondary Filter Row (Desktop): Sizes, Fabrics, Stock */}
        <div className="hidden md:flex items-center justify-between border-t border-[#F3ECE2] pt-3 text-xs text-zinc-600 flex-wrap gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Size Pills */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono uppercase text-zinc-400 mr-1">Size:</span>
              {['all', 'M', 'L', 'XL', 'XXL', '3XL'].map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setSelectedSize(size);
                    updateUrlParams({ size: size === 'all' ? null : size });
                  }}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-colors ${
                    selectedSize === size
                      ? 'bg-[#722F37] text-white font-bold'
                      : 'bg-[#FAF7F2] text-zinc-700 hover:bg-zinc-200/60'
                  }`}
                >
                  {size.toUpperCase()}
                </button>
              ))}
            </div>

            {/* In-Stock Only */}
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => {
                  setOnlyInStock(e.target.checked);
                  updateUrlParams({ inStock: e.target.checked ? 'true' : null });
                }}
                className="w-3.5 h-3.5 rounded text-[#722F37] focus:ring-[#722F37]"
              />
              <span className="text-xs font-medium text-zinc-700">In-Stock Ready Dispatch</span>
            </label>
          </div>

          {/* Reset Filters */}
          {(searchQuery || selectedCategory !== 'all' || selectedCollection !== 'all' || selectedSize !== 'all' || selectedFabric !== 'all' || onlyInStock) && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs text-[#722F37] hover:underline font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Chips & Result Counter */}
      <div className="mt-4 flex items-center justify-between text-xs text-zinc-500 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-zinc-900">
            {filteredProducts.length} Wholesale Designs Available
          </span>

          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-200 text-zinc-800 text-[11px]">
              Keyword: "{searchQuery}"
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => {
                  setSearchQuery('');
                  updateUrlParams({ search: null });
                }}
              />
            </span>
          )}

          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#722F37]/15 text-[#722F37] text-[11px] font-semibold">
              Category: {selectedCategory}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => {
                  setSelectedCategory('all');
                  updateUrlParams({ category: null });
                }}
              />
            </span>
          )}

          {selectedCollection !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#C5A059]/20 text-[#722F37] border border-[#C5A059]/40 text-[11px] font-semibold">
              Collection: {collections.find(c => c.slug === selectedCollection || c.id === selectedCollection)?.name || selectedCollection}
              <X
                className="w-3 h-3 cursor-pointer hover:text-black"
                onClick={() => {
                  setSelectedCollection('all');
                  updateUrlParams({ collection: null });
                }}
              />
            </span>
          )}

          {selectedSize !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-200 text-zinc-800 text-[11px]">
              Size: {selectedSize}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => {
                  setSelectedSize('all');
                  updateUrlParams({ size: null });
                }}
              />
            </span>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="mt-12 bg-white rounded-3xl border border-[#E7E0D5] p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 bg-[#FAF7F2] rounded-full flex items-center justify-center mx-auto text-zinc-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-serif-luxury text-xl font-bold text-zinc-900">
            No Matching Designs Found
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            We couldn't find any wholesale designs matching your current filters. Try searching by design number or clearing your active filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#722F37] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#58111A]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => {
            const fallbackSrc = getProductFallbackImage(product.style_type || product.category?.name);
            const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];
            const imgSrc =
              (primaryImage as any)?.local_url ||
              primaryImage?.image_url ||
              fallbackSrc;
            const isSelected = selectedItems.has(product.id);
            const priceMode = resolvePriceDisplayMode(product, undefined, globalPriceMode);
            const isPriceVisible = priceMode === 'show' && product.base_wholesale_price > 0;

            return (
              <div
                key={product.id}
                className={`group relative bg-white border rounded-2xl overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${
                  isSelected ? 'border-emerald-600 ring-2 ring-emerald-500/30' : 'border-[#E7E0D5]'
                }`}
              >
                {/* Product Image Area (Clickable to Quick View) */}
                <div
                  className="relative aspect-[3/4] w-full bg-[#FAF7F2] overflow-hidden cursor-pointer"
                  onClick={() => setActiveQuickViewProduct(product)}
                >
                  <img
                    src={imgSrc}
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Top Badges (Authentic DN Number) */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
                    <span className="bg-black/85 backdrop-blur-md text-[#C5A059] font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                      {product.code}
                    </span>
                    {product.is_featured && (
                      <span className="bg-[#C5A059] text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1 uppercase tracking-wider">
                        Hit Design
                      </span>
                    )}
                  </div>

                  {/* Style Tag */}
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <span className="bg-white/95 backdrop-blur-md text-[#722F37] border border-[#722F37]/20 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                      {product.style_type}
                    </span>
                  </div>

                  {/* Select Checkbox Top Overlay */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleProductSelection(product);
                    }}
                    className={`absolute bottom-2.5 left-2.5 z-20 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white/90 text-zinc-800 hover:bg-white'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Selected</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 text-[#722F37]" />
                        <span>Select</span>
                      </>
                    )}
                  </button>

                  {/* Quick View Pill (Visible on mobile & desktop) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveQuickViewProduct(product);
                    }}
                    className="absolute bottom-2.5 right-2.5 z-20 bg-white/95 text-zinc-900 text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1 hover:bg-[#722F37] hover:text-white transition-colors cursor-pointer"
                    aria-label={`Quick view ${product.title}`}
                  >
                    <Eye className="w-3 h-3 text-[#C5A059]" />
                    <span>Quick View</span>
                  </button>
                </div>

                {/* Content Area */}
                <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between bg-white">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium flex items-center gap-1 line-clamp-1">
                      <span>{product.fabric}</span>
                      <span>•</span>
                      <span>{product.color}</span>
                    </div>

                    <h3
                      onClick={() => setActiveQuickViewProduct(product)}
                      className="font-serif-luxury text-sm sm:text-base font-semibold text-zinc-900 mt-1 line-clamp-1 group-hover:text-[#722F37] transition-colors cursor-pointer"
                      title={product.title}
                    >
                      {product.title}
                    </h3>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#F3ECE2]">
                    <div className="flex items-baseline justify-between mb-3">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-zinc-400 block font-medium">
                          Wholesale Price
                        </span>
                        {product.price_on_enquiry !== false && product.price_on_request !== false ? (
                          <span className="text-xs font-bold text-[#722F37] block mt-0.5">
                            Price on Enquiry
                          </span>
                        ) : isPriceVisible && product.base_wholesale_price ? (
                          <div className="text-sm sm:text-base font-bold text-[#722F37] tracking-tight">
                            {formatINR(product.base_wholesale_price)}
                            <span className="text-[10px] font-normal text-zinc-500 ml-1">/ pc</span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-[#722F37] block mt-0.5">
                            Price on Enquiry
                          </span>
                        )}
                      </div>

                      <span className="bg-[#FAF7F2] border border-[#E7E0D5] text-zinc-700 text-[10px] font-semibold px-2 py-0.5 rounded">
                        MOQ: {product.moq ? `${product.moq} pcs` : 'On Request'}
                      </span>
                    </div>

                    {/* Action buttons (Specs & Official Quote Enquiry) */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveQuickViewProduct(product)}
                        className="w-full inline-flex items-center justify-center gap-1 py-1.5 text-[11px] font-semibold rounded-lg bg-[#FAF7F2] text-zinc-800 border border-[#E7E0D5] hover:bg-zinc-100 transition-colors cursor-pointer"
                        title="View Full Specifications"
                      >
                        <Layers className="w-3 h-3 text-[#722F37]" />
                        <span>Specs</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveEnquiryProduct(product)}
                        className="w-full inline-flex items-center justify-center gap-1 py-1.5 text-[11px] font-bold rounded-lg bg-[#722F37] text-white hover:bg-[#58111A] transition-colors shadow-2xs cursor-pointer"
                        title="Submit Price Request"
                      >
                        <FileText className="w-3 h-3 text-[#C5A059]" />
                        <span>Get Quote</span>
                      </button>
                    </div>

                    {/* WhatsApp Fast-Track Inquiry Action */}
                    <a
                      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                        `Hello Bhavya Fashions, I am requesting wholesale quotation & stock for design: ${product.code} - ${product.title} (${product.style_type}, Fabric: ${product.fabric}, MOQ: ${product.moq} pcs).`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 w-full inline-flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-bold rounded-lg bg-[#25D366]/10 text-emerald-800 border border-emerald-300 hover:bg-[#25D366] hover:text-white transition-all shadow-2xs"
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
      )}

      {/* Floating Selected Products Bar (Sticky on Desktop and Mobile) */}
      {selectedCount > 0 && (
        <aside aria-label="Selected products actions" className="fixed bottom-0 left-0 right-0 z-40 bg-[#1C1215]/95 backdrop-blur-md border-t border-[#C5A059]/40 py-3 px-4 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-[#C5A059] text-[#1C1215] font-bold text-xs flex items-center justify-center font-mono">
                {selectedCount}
              </span>
              <div>
                <span className="text-xs sm:text-sm font-bold text-white block">
                  {selectedCount} {selectedCount === 1 ? 'Design' : 'Designs'} Selected
                </span>
                <span className="text-[10px] text-zinc-400 hidden sm:inline">
                  Ready to send DN numbers directly to WhatsApp wholesale desk
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectionDrawerOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Review Items
              </button>

              <a
                href={whatsappUrl}
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

      {/* Selection Review Sheet Drawer */}
      {selectionDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectionDrawerOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col justify-between p-6 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E7E0D5]">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#722F37] font-bold">
                    Wholesale Selection Summary
                  </span>
                  <h3 className="font-serif-luxury text-xl font-bold text-[#1C1917]">
                    Selected Designs ({selectedCount})
                  </h3>
                </div>
                <button
                  onClick={() => setSelectionDrawerOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-lg hover:bg-zinc-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="mt-4 space-y-4">
                {Array.from(selectedItems.values()).map(({ product, sizeBreakdown, totalQuantity }) => {
                  const fallbackSrc = getProductFallbackImage(product.style_type || product.category?.name);
                  const firstImg = product.images?.[0];
                  const img =
                    (firstImg as any)?.local_url ||
                    firstImg?.image_url ||
                    fallbackSrc;
                  return (
                    <div
                      key={product.id}
                      className="p-3.5 rounded-xl border border-[#E7E0D5] bg-[#FAF7F2] space-y-2.5"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={img}
                          alt={product.title}
                          className="w-12 h-16 object-cover object-top rounded-lg bg-white border border-[#E7E0D5] shrink-0"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (target.src !== fallbackSrc) {
                              target.src = fallbackSrc;
                            }
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-mono font-bold text-[#C5A059] bg-black/80 px-2 py-0.5 rounded">
                            {product.code}
                          </span>
                          <h4 className="font-serif-luxury text-sm font-semibold text-zinc-900 truncate mt-1">
                            {product.title}
                          </h4>
                          <span className="text-[10px] text-zinc-500 block">
                            MOQ: {product.moq} pcs • {product.fabric}
                          </span>
                        </div>
                        <button
                          onClick={() => removeSelectedItem(product.id)}
                          className="text-zinc-400 hover:text-red-600 p-1"
                          title="Remove item"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Size Breakdown Inputs */}
                      {product.variants?.length > 0 && (
                        <div className="pt-2 border-t border-zinc-200/60">
                          <span className="text-[10px] font-semibold text-zinc-700 block mb-1">
                            Size Breakdown (Pieces):
                          </span>
                          <div className="grid grid-cols-4 gap-1.5">
                            {product.variants.map((v) => (
                              <div key={v.size} className="text-center">
                                <span className="text-[10px] font-mono text-zinc-500 block">{v.size}</span>
                                <input
                                  type="number"
                                  min={0}
                                  value={sizeBreakdown[v.size] ?? 0}
                                  onChange={(e) => updateItemQuantity(product.id, v.size, Number(e.target.value))}
                                  className="w-full text-xs font-mono font-bold text-center p-1 rounded border border-[#E7E0D5] bg-white"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Drawer Bottom Actions */}
            <div className="pt-6 border-t border-[#E7E0D5] space-y-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#20ba59] shadow-lg"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Send {selectedCount} Designs on WhatsApp</span>
              </a>

              <button
                onClick={() => setSelectedItems(new Map())}
                className="w-full text-center text-xs text-zinc-500 hover:text-red-600 underline"
              >
                Clear All Selections
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filter Sheet */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl z-10 flex flex-col justify-between p-6 overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E7E0D5]">
                <h3 className="font-serif-luxury text-lg font-bold text-zinc-900">
                  Filter Wholesale Catalog
                </h3>
                <button onClick={() => setMobileFilterOpen(false)}>
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              {/* Category */}
              <div>
                <span className="text-xs font-bold uppercase text-zinc-700 block mb-2">Category</span>
                <div className="space-y-1.5">
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      updateUrlParams({ category: null });
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium ${
                      selectedCategory === 'all' ? 'bg-[#722F37] text-white' : 'bg-zinc-100 text-zinc-800'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCategory(c.name);
                        updateUrlParams({ category: c.name });
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium ${
                        selectedCategory === c.name ? 'bg-[#722F37] text-white' : 'bg-zinc-100 text-zinc-800'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Collections */}
              {collections && collections.length > 0 && (
                <div>
                  <span className="text-xs font-bold uppercase text-zinc-700 block mb-2">Collection / Series</span>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => {
                        setSelectedCollection('all');
                        updateUrlParams({ collection: null });
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium ${
                        selectedCollection === 'all' ? 'bg-[#C5A059] text-white font-bold' : 'bg-zinc-100 text-zinc-800'
                      }`}
                    >
                      All Collections
                    </button>
                    {collections.map((col) => (
                      <button
                        key={col.id}
                        onClick={() => {
                          setSelectedCollection(col.slug);
                          updateUrlParams({ collection: col.slug });
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium ${
                          selectedCollection === col.slug ? 'bg-[#C5A059] text-white font-bold' : 'bg-zinc-100 text-zinc-800'
                        }`}
                      >
                        {col.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              <div>
                <span className="text-xs font-bold uppercase text-zinc-700 block mb-2">Size</span>
                <div className="grid grid-cols-3 gap-2">
                  {['all', 'M', 'L', 'XL', 'XXL', '3XL'].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setSelectedSize(s);
                        updateUrlParams({ size: s === 'all' ? null : s });
                      }}
                      className={`py-2 text-xs font-mono font-semibold rounded-lg ${
                        selectedSize === s ? 'bg-[#722F37] text-white' : 'bg-zinc-100 text-zinc-800'
                      }`}
                    >
                      {s.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#E7E0D5] space-y-2">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-[#722F37] text-white text-xs font-bold uppercase tracking-wider rounded-xl"
              >
                Apply Filters ({filteredProducts.length} Results)
              </button>
              <button
                onClick={handleResetFilters}
                className="w-full py-2 text-xs text-zinc-500 hover:text-zinc-900"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Interactive Modal */}
      <QuickViewModal
        product={activeQuickViewProduct}
        onClose={() => setActiveQuickViewProduct(null)}
        priceModeOverride={globalPriceMode}
        onSelectProduct={(prod) => toggleProductSelection(prod)}
        isSelected={activeQuickViewProduct ? selectedItems.has(activeQuickViewProduct.id) : false}
      />

      {/* Standalone Price on Request Modal */}
      <ProductEnquiryModal
        product={activeEnquiryProduct}
        isOpen={Boolean(activeEnquiryProduct)}
        onClose={() => setActiveEnquiryProduct(null)}
        sourcePage="/wholesale"
      />
    </div>
  );
}
