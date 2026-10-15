'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product, Category, Collection, ProductImage } from '@/types';
import { saveProduct } from '@/lib/repository/products';
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';

interface ProductEditorProps {
  initialProduct?: Product | null;
  categories: Category[];
  collections: Collection[];
}

export function ProductEditor({
  initialProduct,
  categories,
  collections,
}: ProductEditorProps) {
  const router = useRouter();
  const isEditing = Boolean(initialProduct);

  const [code, setCode] = useState(initialProduct?.code || `BF-K-${Math.floor(100 + Math.random() * 900)}`);
  const [title, setTitle] = useState(initialProduct?.title || '');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [categoryId, setCategoryId] = useState(initialProduct?.category_id || categories[0]?.id || '');
  const [fabric, setFabric] = useState(initialProduct?.fabric || 'Pure Cotton 60-60');
  const [color, setColor] = useState(initialProduct?.color || 'Pastel Wine');
  const [styleType, setStyleType] = useState(initialProduct?.style_type || '3-Piece Kurti Pant Dupatta');
  const [price, setPrice] = useState<number>(initialProduct?.base_wholesale_price || 699);
  const [moq, setMoq] = useState<number>(initialProduct?.moq || 6);
  const [stockStatus, setStockStatus] = useState(initialProduct?.stock_status || 'in_stock');
  const [isFeatured, setIsFeatured] = useState(initialProduct?.is_featured || false);
  const [images, setImages] = useState<ProductImage[]>(
    initialProduct?.images?.length ? initialProduct.images : [
      { id: 'img-1', image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85', display_order: 0, is_primary: true }
    ]
  );
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImages(prev => [
      ...prev,
      {
        id: `img-${Date.now()}`,
        image_url: newImageUrl.trim(),
        display_order: prev.length,
        is_primary: prev.length === 0,
      },
    ]);
    setNewImageUrl('');
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages(prev => prev.map((img, idx) => ({ ...img, is_primary: idx === index })));
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim()) {
      alert('Please fill in product title and code.');
      return;
    }

    setIsSaving(true);
    try {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      await saveProduct({
        id: initialProduct?.id,
        code: code.trim().toUpperCase(),
        title: title.trim(),
        slug,
        description: description.trim(),
        category_id: categoryId,
        fabric: fabric.trim(),
        color: color.trim(),
        style_type: styleType.trim(),
        base_wholesale_price: Number(price),
        currency: 'INR',
        moq: Number(moq),
        stock_status: stockStatus as any,
        is_active: true,
        is_featured: isFeatured,
        images,
        variants: [
          { id: 'v-m', size: 'M', stock_quantity: 50, is_available: true },
          { id: 'v-l', size: 'L', stock_quantity: 50, is_available: true },
          { id: 'v-xl', size: 'XL', stock_quantity: 50, is_available: true },
          { id: 'v-xxl', size: 'XXL', stock_quantity: 30, is_available: true },
        ],
      });

      router.push('/admin/products');
    } catch (err: any) {
      alert(err.message || 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E7E0D5]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-lg bg-white border border-[#E7E0D5] text-[#78716C] hover:text-[#1C1917]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#722F37] font-bold">
              {isEditing ? 'Product Modification' : 'New Design Entry'}
            </span>
            <h1 className="font-serif-luxury text-2xl font-bold text-[#1C1917]">
              {isEditing ? `Edit Design: ${initialProduct?.code}` : 'Add New Wholesale Kurti'}
            </h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Specs */}
        <div className="bg-white p-6 rounded-2xl border border-[#E7E0D5] shadow-xs space-y-4">
          <h2 className="font-serif-luxury text-base font-bold text-[#1C1917] pb-2 border-b border-[#F3ECE2]">
            Essential Wholesale Specifications
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Unique Product Code *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. BF-3PC-105"
                className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Product Title / Design Name *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Noor Alia Cut Pleated Rayon Kurti"
                className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2]"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Base Wholesale Price (INR) *
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Minimum Order Quantity (MOQ) *
              </label>
              <input
                type="number"
                required
                value={moq}
                onChange={(e) => setMoq(Number(e.target.value))}
                className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Fabric Material
              </label>
              <input
                type="text"
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                placeholder="e.g. Pure Muslin Silk"
                className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Color
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Indigo Blue"
                className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Style / Cut Type
              </label>
              <input
                type="text"
                value={styleType}
                onChange={(e) => setStyleType(e.target.value)}
                placeholder="e.g. 2-Piece Kurti Pant"
                className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1917] mb-1">
              Design Description & Work Highlights
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Hand sequence yoke work, matched straight cigarette pant, digitally printed dupatta..."
              className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2]"
            />
          </div>
        </div>

        {/* Image Gallery Management */}
        <div className="bg-white p-6 rounded-2xl border border-[#E7E0D5] shadow-xs space-y-4">
          <h2 className="font-serif-luxury text-base font-bold text-[#1C1917] pb-2 border-b border-[#F3ECE2]">
            High-Resolution Photography Gallery
          </h2>

          {/* Add Image by URL */}
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Paste high-res image URL (e.g. Unsplash or Supabase storage)..."
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="flex-1 text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2]"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="px-4 py-2 bg-[#722F37] text-white rounded-lg text-xs font-bold uppercase tracking-wider"
            >
              Add Image
            </button>
          </div>

          {/* Thumbnails Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            {images.map((img, idx) => (
              <div
                key={img.id || idx}
                className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 group ${
                  img.is_primary ? 'border-[#722F37]' : 'border-[#E7E0D5]'
                }`}
              >
                <img src={img.image_url} alt="" className="w-full h-full object-cover object-top" />

                {img.is_primary && (
                  <span className="absolute top-2 left-2 bg-[#722F37] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    Primary
                  </span>
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!img.is_primary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimaryImage(idx)}
                      className="px-2 py-1 bg-white text-[#1C1917] rounded text-[10px] font-bold"
                    >
                      Set Primary
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="p-1.5 bg-red-600 text-white rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7E0D5]">
          <Link
            href="/admin/products"
            className="px-5 py-2.5 rounded-lg border border-[#E7E0D5] bg-white text-[#1C1917] text-xs font-bold uppercase tracking-wider"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#722F37] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#5C1D24] disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Saving Product...' : 'Save Product to Database'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
