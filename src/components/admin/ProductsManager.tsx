'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Product, Category } from '@/types';
import { formatINR } from '@/lib/utils';
import {
  PlusCircle,
  Search,
  Download,
  Edit,
  Trash2,
  CheckCircle2,
  Layers,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  ExternalLink,
  Loader2,
  Sparkles,
  ArrowUpDown,
  Image as ImageIcon,
} from 'lucide-react';

interface ProductsManagerProps {
  initialProducts: Product[];
  categories: Category[];
}

export function ProductsManager({ initialProducts, categories }: ProductsManagerProps) {
  // Sort initial products newest-first by default
  const sortedInitial = useMemo(() => {
    return [...initialProducts].sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
    });
  }, [initialProducts]);

  const [products, setProducts] = useState<Product[]>(sortedInitial);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'code' | 'price-asc' | 'price-desc' | 'title'>('newest');

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Quick View Images Modal State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Synchronize when initialProducts prop updates
  useEffect(() => {
    setProducts(sortedInitial);
  }, [sortedInitial]);

  // Keyboard navigation for Quick View Modal
  useEffect(() => {
    if (!quickViewProduct) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setQuickViewProduct(null);
      } else if (e.key === 'ArrowLeft') {
        const total = quickViewProduct.images?.length || 0;
        if (total > 1) {
          setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
        }
      } else if (e.key === 'ArrowRight') {
        const total = quickViewProduct.images?.length || 0;
        if (total > 1) {
          setActiveImageIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quickViewProduct]);

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    const list = products.filter((p) => {
      if (selectedCategory !== 'all' && p.category_id !== selectedCategory) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          p.code.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          (p.fabric && p.fabric.toLowerCase().includes(q))
        );
      }
      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === 'price-asc') return (a.base_wholesale_price || 0) - (b.base_wholesale_price || 0);
      if (sortBy === 'price-desc') return (b.base_wholesale_price || 0) - (a.base_wholesale_price || 0);
      if (sortBy === 'code') return a.code.localeCompare(b.code);
      if (sortBy === 'title') return a.title.localeCompare(b.title);

      // Default: Newest first
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
    });
  }, [products, search, selectedCategory, sortBy]);

  // Bulk Selection Handlers
  const isAllFilteredSelected =
    filteredProducts.length > 0 && filteredProducts.every((p) => selectedIds.has(p.id));

  const isSomeFilteredSelected =
    filteredProducts.some((p) => selectedIds.has(p.id)) && !isAllFilteredSelected;

  const handleToggleSelectAll = () => {
    if (isAllFilteredSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredProducts.forEach((p) => next.delete(p.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredProducts.forEach((p) => next.add(p.id));
        return next;
      });
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  // Single Product Delete
  const handleDelete = async (id: string, title?: string, code?: string) => {
    const displayName = title ? `"${title}" (${code || id})` : code || id;
    if (
      !confirm(
        `Are you sure you want to permanently delete design ${displayName} from the database? This cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch('/api/products/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ids: [id] }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete product from database');
      }

      // Immediately remove from UI state
      setProducts((prev) => prev.filter((p) => p.id !== id && p.code !== id && p.code !== code));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err: any) {
      alert(err.message || 'Error deleting product');
    } finally {
      setDeletingId(null);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    if (count === 0) return;

    if (
      !confirm(
        `Are you sure you want to permanently delete ALL ${count} selected products from the database? This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    const idsToDelete = Array.from(selectedIds);

    try {
      const res = await fetch('/api/products/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsToDelete }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete selected products');
      }

      // Immediately filter out all selected products from local state
      const idSet = new Set(idsToDelete);
      setProducts((prev) => prev.filter((p) => !idSet.has(p.id) && !idSet.has(p.code)));
      setSelectedIds(new Set());
    } catch (err: any) {
      alert(err.message || 'Error executing bulk deletion');
    } finally {
      setIsDeleting(false);
    }
  };

  // Quick View Trigger
  const handleOpenQuickView = (prod: Product, startIndex = 0) => {
    setQuickViewProduct(prod);
    setActiveImageIndex(startIndex);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Code',
      'Title',
      'Fabric',
      'Style',
      'Price_INR',
      'MOQ',
      'Stock_Status',
      'Sizes',
      'Primary_Image_URL',
      'All_Image_URLs',
      'Created_At',
    ];
    const rows = filteredProducts.map((p) => {
      const primaryImg =
        p.images?.find((i) => i.is_primary)?.image_url || p.images?.[0]?.image_url || '';
      const allImgs = (p.images || []).map((i) => i.image_url).join(' ; ');
      return [
        p.code,
        `"${p.title.replace(/"/g, '""')}"`,
        p.fabric,
        p.style_type,
        p.base_wholesale_price,
        p.moq,
        p.stock_status,
        `"${p.variants?.map((v) => v.size).join(',')}"`,
        `"${primaryImg}"`,
        `"${allImgs}"`,
        `"${p.created_at || ''}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `bhavya_fashions_products_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#722F37] font-bold">
            Master Inventory
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1C1917]">
            Product Database ({products.length})
          </h1>
          <p className="text-xs text-[#78716C] mt-0.5">
            Designs are automatically ordered with the latest added items appearing first.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#E7E0D5] text-xs font-bold uppercase tracking-wider text-[#1C1917] hover:bg-[#FAF7F2] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#722F37] text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-[#5C1D24] transition-all transform hover:-translate-y-0.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Bulk Selection Action Banner */}
      {selectedIds.size > 0 && (
        <div className="bg-gradient-to-r from-[#722F37] to-[#4A151B] text-white p-3.5 sm:p-4 rounded-xl shadow-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top duration-200">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs">
              {selectedIds.size}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">
                {selectedIds.size} design{selectedIds.size > 1 ? 's' : ''} selected
              </p>
              <p className="text-[11px] text-white/80">
                You can delete them in bulk or clear your selection.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold tracking-wider text-white transition-colors"
            >
              {isAllFilteredSelected
                ? 'Deselect Visible'
                : `Select All Visible (${filteredProducts.length})`}
            </button>

            <button
              type="button"
              onClick={handleClearSelection}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold tracking-wider text-white transition-colors"
            >
              Clear Selection
            </button>

            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedIds.size})</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E0D5] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products by code, name, fabric..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#FAF7F2] border border-[#E7E0D5] rounded-lg px-2 py-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#78716C]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-transparent border-0 focus:outline-none font-semibold text-[#1C1917] pr-2 cursor-pointer"
            >
              <option value="newest">Newest Added (Default)</option>
              <option value="code">Design Code (A-Z)</option>
              <option value="title">Title (A-Z)</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-[#E7E0D5] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] border-b border-[#E7E0D5] uppercase text-[10px] text-[#78716C] font-bold tracking-wider">
              <tr>
                {/* Select All Checkbox */}
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllFilteredSelected}
                    ref={(input) => {
                      if (input) {
                        input.indeterminate = isSomeFilteredSelected;
                      }
                    }}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#722F37] focus:ring-[#722F37] cursor-pointer"
                    title="Select / Deselect all visible designs"
                  />
                </th>
                <th className="py-3 px-4">Design & Quick View</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Fabric & Style</th>
                <th className="py-3 px-4">Wholesale Price</th>
                <th className="py-3 px-4">MOQ</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3ECE2]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#78716C]">
                    <ImageIcon className="w-8 h-8 mx-auto text-[#78716C]/40 mb-2" />
                    <p className="font-semibold text-sm text-[#1C1917]">No products found</p>
                    <p className="text-xs text-[#78716C] mt-1">
                      Try adjusting your search query or filter category.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const isSelected = selectedIds.has(prod.id);
                  const isCurrentlyDeleting = deletingId === prod.id;
                  const imagesList = prod.images || [];
                  const primaryImgUrl =
                    (prod.images?.[0] as any)?.local_url ||
                    prod.images?.[0]?.image_url ||
                    '/images/cat-3piece.jpg';

                  return (
                    <tr
                      key={prod.id}
                      className={`hover:bg-[#FAF7F2]/60 transition-colors ${
                        isSelected ? 'bg-[#FAF7F2]' : ''
                      }`}
                    >
                      {/* Row Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(prod.id)}
                          className="w-4 h-4 rounded border-gray-300 text-[#722F37] focus:ring-[#722F37] cursor-pointer"
                        />
                      </td>

                      {/* Design Column with Clickable Image Quick View */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => handleOpenQuickView(prod, 0)}
                            className="relative group w-11 h-14 rounded-md overflow-hidden bg-[#EFE9E0] shrink-0 cursor-pointer border border-[#E7E0D5] hover:border-[#722F37] transition-all"
                            title="Click to quick view images"
                          >
                            <img
                              src={primaryImgUrl}
                              alt={prod.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.currentTarget;
                                if (target.src !== '/images/cat-3piece.jpg') {
                                  target.src = '/images/cat-3piece.jpg';
                                }
                              }}
                            />
                            {/* Hover overlay with Eye icon */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Eye className="w-4 h-4 drop-shadow" />
                            </div>

                            {/* Multiple image count pill */}
                            {imagesList.length > 1 && (
                              <span className="absolute bottom-0.5 right-0.5 bg-black/75 text-white text-[9px] font-mono px-1 rounded font-bold">
                                {imagesList.length}
                              </span>
                            )}
                          </div>

                          <div>
                            <button
                              type="button"
                              onClick={() => handleOpenQuickView(prod, 0)}
                              className="font-bold text-[#1C1917] hover:text-[#722F37] text-left block line-clamp-1 transition-colors"
                            >
                              {prod.title}
                            </button>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-[#78716C]">
                                {prod.category?.name || 'Kurti'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleOpenQuickView(prod, 0)}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-[#722F37] hover:underline"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Quick View</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Code */}
                      <td className="py-3 px-4 font-mono font-bold text-[#722F37]">
                        {prod.code}
                      </td>

                      {/* Fabric & Style */}
                      <td className="py-3 px-4 text-[#44403C]">
                        <div className="font-medium">{prod.fabric}</div>
                        <div className="text-[10px] text-[#78716C]">{prod.style_type}</div>
                      </td>

                      {/* Wholesale Price */}
                      <td className="py-3 px-4">
                        {prod.price_on_enquiry !== false && prod.price_on_request !== false ? (
                          <div>
                            <span className="text-xs font-bold text-[#722F37] block">
                              Quote on Request
                            </span>
                            <span className="text-[9px] font-mono bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded font-semibold inline-block mt-0.5">
                              Enquiry Only
                            </span>
                          </div>
                        ) : prod.base_wholesale_price ? (
                          <div className="font-bold text-[#1C1917]">
                            {formatINR(prod.base_wholesale_price)}
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-500 font-semibold">
                            Quote on Request
                          </span>
                        )}
                      </td>

                      {/* MOQ */}
                      <td className="py-3 px-4">
                        <span className="bg-[#FAF7F2] border px-2 py-0.5 rounded font-mono font-semibold text-xs">
                          {prod.moq ? `${prod.moq} pcs` : 'On Request'}
                        </span>
                      </td>

                      {/* Stock Status */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>In Stock</span>
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick View Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenQuickView(prod, 0)}
                            className="p-1.5 rounded-lg hover:bg-[#722F37]/10 text-[#78716C] hover:text-[#722F37] transition-colors"
                            title="Quick view images"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Button */}
                          <Link
                            href={`/admin/products/${prod.id}/edit`}
                            className="p-1.5 rounded-lg hover:bg-[#EFE9E0] text-[#78716C] hover:text-[#1C1917] transition-colors"
                            title="Edit product"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDelete(prod.id, prod.title, prod.code)}
                            disabled={isCurrentlyDeleting}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-[#78716C] hover:text-red-600 transition-colors disabled:opacity-50"
                            title="Delete product"
                          >
                            {isCurrentlyDeleting ? (
                              <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick View Images Modal / Lightbox */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-[#E7E0D5]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#FAF7F2] border-b border-[#E7E0D5] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#722F37] font-bold">
                  Design Imagery Gallery • {quickViewProduct.code}
                </span>
                <h3 className="font-serif-luxury text-lg font-bold text-[#1C1917]">
                  {quickViewProduct.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/products/${quickViewProduct.id}/edit`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E7E0D5] text-xs font-bold text-[#1C1917] hover:bg-[#FAF7F2] transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Design</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setQuickViewProduct(null)}
                  className="p-2 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-black/5 transition-colors"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Large Preview + Carousel Navigation */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Main Image Stage */}
              <div className="relative aspect-[4/5] sm:aspect-[16/10] max-h-[460px] bg-[#FAF7F2] rounded-xl overflow-hidden border border-[#E7E0D5] flex items-center justify-center">
                {(() => {
                  const currentImage =
                    quickViewProduct.images?.[activeImageIndex] || quickViewProduct.images?.[0];
                  const imgUrl =
                    (currentImage as any)?.local_url ||
                    currentImage?.image_url ||
                    '/images/cat-3piece.jpg';

                  return (
                    <img
                      src={imgUrl}
                      alt={quickViewProduct.title}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src !== '/images/cat-3piece.jpg') {
                          target.src = '/images/cat-3piece.jpg';
                        }
                      }}
                    />
                  );
                })()}

                {/* Left / Right Nav Arrows */}
                {(quickViewProduct.images?.length || 0) > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev > 0 ? prev - 1 : (quickViewProduct.images?.length || 1) - 1
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#1C1917] shadow-lg flex items-center justify-center transition-all hover:scale-105"
                      title="Previous Image (Left Arrow)"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev < (quickViewProduct.images?.length || 1) - 1 ? prev + 1 : 0
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#1C1917] shadow-lg flex items-center justify-center transition-all hover:scale-105"
                      title="Next Image (Right Arrow)"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Image Counter Badge */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-mono font-semibold">
                      Photo {activeImageIndex + 1} of {quickViewProduct.images?.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails Row */}
              {(quickViewProduct.images?.length || 0) > 1 && (
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#78716C] font-bold block mb-2">
                    All Available Photos ({quickViewProduct.images?.length})
                  </span>
                  <div className="flex items-center gap-3 overflow-x-auto pb-2">
                    {quickViewProduct.images?.map((img, idx) => {
                      const thumbUrl = (img as any)?.local_url || img.image_url || '/images/cat-3piece.jpg';
                      const isCurrent = idx === activeImageIndex;

                      return (
                        <button
                          key={img.id || idx}
                          type="button"
                          onClick={() => setActiveImageIndex(idx)}
                          className={`relative w-16 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                            isCurrent
                              ? 'border-[#722F37] ring-2 ring-[#722F37]/30 scale-102'
                              : 'border-[#E7E0D5] hover:border-[#722F37]/50 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={thumbUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (target.src !== '/images/cat-3piece.jpg') {
                                target.src = '/images/cat-3piece.jpg';
                              }
                            }}
                          />
                          {img.is_primary && (
                            <span className="absolute top-0.5 right-0.5 bg-[#722F37] text-white text-[8px] px-1 rounded font-bold uppercase">
                              Main
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Product Specifications Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#FAF7F2] rounded-xl border border-[#E7E0D5] text-xs">
                <div>
                  <span className="text-[10px] text-[#78716C] uppercase font-bold block">
                    Fabric & Style
                  </span>
                  <p className="font-semibold text-[#1C1917] mt-0.5">{quickViewProduct.fabric}</p>
                  <p className="text-[10px] text-[#78716C]">{quickViewProduct.style_type}</p>
                </div>

                <div>
                  <span className="text-[10px] text-[#78716C] uppercase font-bold block">
                    Trade Price
                  </span>
                  <p className="font-bold text-[#722F37] text-sm mt-0.5">
                    {quickViewProduct.price_on_enquiry !== false
                      ? 'Quote on Request'
                      : formatINR(quickViewProduct.base_wholesale_price)}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-[#78716C] uppercase font-bold block">
                    MOQ & Stock
                  </span>
                  <p className="font-semibold text-[#1C1917] mt-0.5">
                    {quickViewProduct.moq ? `${quickViewProduct.moq} pcs ratio pack` : 'On Request'}
                  </p>
                  <span className="text-emerald-700 text-[10px] font-bold">In Stock</span>
                </div>

                <div>
                  <span className="text-[10px] text-[#78716C] uppercase font-bold block">
                    Available Sizes
                  </span>
                  <p className="font-mono font-semibold text-[#1C1917] mt-0.5">
                    {quickViewProduct.variants?.map((v) => v.size).join(', ') || 'M, L, XL, XXL'}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-[#FAF7F2] border-t border-[#E7E0D5] flex items-center justify-between">
              <span className="text-[11px] text-[#78716C]">
                Tip: Press <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px]">←</kbd> and{' '}
                <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px]">→</kbd> keys to flip photos,{' '}
                <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px]">Esc</kbd> to close.
              </span>

              <button
                type="button"
                onClick={() => setQuickViewProduct(null)}
                className="px-4 py-1.5 rounded-lg bg-[#1C1917] text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
