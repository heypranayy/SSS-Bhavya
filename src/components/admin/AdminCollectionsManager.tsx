'use client';

import React, { useState } from 'react';
import { Collection, Product } from '@/types';
import { ImageUploadDropzone } from '@/components/ui/ImageUploadDropzone';
import {
  PlusCircle,
  FolderTree,
  Sparkles,
  Edit2,
  Check,
  X,
  ExternalLink,
  Loader2,
  Trash2,
} from 'lucide-react';

interface AdminCollectionsManagerProps {
  initialCollections: Collection[];
  products: Product[];
}

export function AdminCollectionsManager({
  initialCollections,
  products,
}: AdminCollectionsManagerProps) {
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('');
    setIsFeatured(true);
    setErrorMsg(null);
    setModalOpen(true);
  };

  const openEditModal = (col: Collection) => {
    setEditingId(col.id);
    setName(col.name);
    setSlug(col.slug);
    setDescription(col.description || '');
    setImageUrl(col.image_url || '');
    setIsFeatured(Boolean(col.is_featured));
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Collection name is required');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const payload = {
        id: editingId || undefined,
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim(),
        image_url: imageUrl || '/images/cat-3piece.jpg',
        is_featured: isFeatured,
      };

      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save collection');

      if (editingId) {
        setCollections(prev => prev.map(c => c.id === editingId ? data.collection : c));
      } else {
        setCollections(prev => [data.collection, ...prev]);
      }

      setModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving collection');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCollection = async (id: string, colName: string) => {
    if (!confirm(`Are you sure you want to permanently delete collection "${colName}"? Products associated with this series will remain in inventory.`)) return;

    try {
      const res = await fetch('/api/collections/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete collection');
      setCollections(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error deleting collection');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#722F37] font-bold">
            Catalog Series &amp; Lookbooks
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1C1917]">
            Collections Management ({collections.length})
          </h1>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#722F37] text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-[#5C1D24] transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Collection</span>
        </button>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((col) => {
          const count = products.filter(p =>
            p.collections?.some(c => c.id === col.id || c.slug === col.slug)
          ).length;

          return (
            <div
              key={col.id}
              className="bg-white rounded-2xl border border-[#E7E0D5] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/9] bg-[#EFE9E0] overflow-hidden">
                  {col.image_url && (
                    <img
                      src={col.image_url}
                      alt={col.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  )}
                  {col.is_featured && (
                    <span className="absolute top-2 right-2 bg-[#C5A059] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                      Featured
                    </span>
                  )}
                  <span className="absolute bottom-2 left-2 bg-black/70 text-white font-mono text-[10px] px-2 py-0.5 rounded">
                    /{col.slug}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="font-serif-luxury text-base font-bold text-[#1C1917]">
                    {col.name}
                  </h3>
                  {col.description && (
                    <p className="text-xs text-[#78716C] line-clamp-2">
                      {col.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="pt-3 border-t border-[#F3ECE2] flex items-center justify-between text-xs">
                  <span className="text-[#78716C]">
                    <strong className="text-[#722F37]">{count || col.product_count || 4}</strong> Designs
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(col)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#E7E0D5] text-[#1C1917] hover:bg-[#EFE9E0] font-semibold text-xs transition-colors"
                      title="Edit Collection"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#722F37]" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteCollection(col.id, col.name)}
                      className="p-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors"
                      title="Delete Collection"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Collection Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E7E0D5] space-y-5 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E0D5]">
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-[#722F37]" />
                <h3 className="font-serif-luxury text-lg font-bold text-[#1C1917]">
                  {editingId ? 'Edit Collection' : 'Create New Collection'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                  Collection Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingId && !slug) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30));
                    }
                  }}
                  placeholder="e.g. Royal Kesaria Silk 2026"
                  className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#722F37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                  URL Slug (Optional)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))}
                  placeholder="e.g. royal-kesaria-silk-2026"
                  className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] font-mono focus:bg-white focus:outline-none focus:border-[#722F37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description for wholesale buyers..."
                  className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#722F37]"
                />
              </div>

              {/* Cover Image Upload with Under-50KB Compressor */}
              <div>
                <ImageUploadDropzone
                  value={imageUrl}
                  onChange={(url) => setImageUrl(url)}
                  label="Collection Cover Image (Auto < 50KB High-Res)"
                  helperText="Upload any local photo from your system. We automatically optimize it under 50KB with pristine quality."
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-[#722F37] accent-[#722F37]"
                />
                <label htmlFor="featured-check" className="text-xs text-[#1C1917] font-medium cursor-pointer">
                  Feature this collection on wholesale home and lookbooks
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7E0D5]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#E7E0D5] text-xs font-bold text-zinc-600 hover:bg-zinc-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#722F37] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5C1D24] disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{editingId ? 'Save Changes' : 'Create Collection'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
