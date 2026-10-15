'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product, Category } from '@/types';
import { formatINR } from '@/lib/utils';
import {
  PlusCircle,
  Search,
  Download,
  Upload,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Layers,
} from 'lucide-react';

interface ProductsManagerProps {
  initialProducts: Product[];
  categories: Category[];
}

export function ProductsManager({ initialProducts, categories }: ProductsManagerProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'all' && p.category_id !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.code.toLowerCase().includes(q) || p.title.toLowerCase().includes(q) || p.fabric.toLowerCase().includes(q);
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['Code', 'Title', 'Fabric', 'Style', 'Price_INR', 'MOQ', 'Stock_Status', 'Sizes'];
    const rows = filteredProducts.map(p => [
      p.code,
      `"${p.title.replace(/"/g, '""')}"`,
      p.fabric,
      p.style_type,
      p.base_wholesale_price,
      p.moq,
      p.stock_status,
      `"${p.variants?.map(v => v.size).join(',')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bhavya_fashions_products_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to remove this product from the database?')) return;
    setProducts(prev => prev.filter(p => p.id !== id));
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
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#E7E0D5] text-xs font-bold uppercase tracking-wider text-[#1C1917] hover:bg-[#FAF7F2]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#722F37] text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-[#5C1D24]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E0D5] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products by code, name, fabric..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2]"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2]"
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Products Table / Cards */}
      <div className="bg-white rounded-2xl border border-[#E7E0D5] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] border-b border-[#E7E0D5] uppercase text-[10px] text-[#78716C] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Design</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Fabric & Style</th>
                <th className="py-3 px-4">Wholesale Price</th>
                <th className="py-3 px-4">MOQ</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3ECE2]">
              {filteredProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.images[0]?.image_url}
                        alt=""
                        className="w-10 h-12 object-cover rounded bg-[#EFE9E0] shrink-0"
                      />
                      <div>
                        <span className="font-bold text-[#1C1917] block line-clamp-1">{prod.title}</span>
                        <span className="text-[10px] text-[#78716C]">{prod.category?.name || 'Kurti'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#722F37]">
                    {prod.code}
                  </td>
                  <td className="py-3 px-4 text-[#44403C]">
                    <div>{prod.fabric}</div>
                    <div className="text-[10px] text-[#78716C]">{prod.style_type}</div>
                  </td>
                  <td className="py-3 px-4 font-bold text-[#1C1917]">
                    {formatINR(prod.base_wholesale_price)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-[#FAF7F2] border px-2 py-0.5 rounded font-mono font-semibold">
                      {prod.moq} pcs
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>In Stock</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${prod.id}/edit`}
                        className="p-1.5 rounded hover:bg-[#EFE9E0] text-[#78716C] hover:text-[#1C1917]"
                        title="Edit product"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(prod.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-[#78716C] hover:text-red-600"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
