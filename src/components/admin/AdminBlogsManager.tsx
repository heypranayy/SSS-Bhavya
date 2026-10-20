'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { BlogPost } from '@/lib/repository/blogs';
import { ImageUploadDropzone } from '@/components/ui/ImageUploadDropzone';
import {
  FileText,
  PlusCircle,
  Calendar,
  ExternalLink,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  Tag,
} from 'lucide-react';

interface AdminBlogsManagerProps {
  initialBlogs: BlogPost[];
}

export function AdminBlogsManager({ initialBlogs }: AdminBlogsManagerProps) {
  const [blogs, setBlogs] = useState<BlogPost[]>(initialBlogs);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Ethnic Trends');
  const [author, setAuthor] = useState('Bhavya Fashions Editorial');
  const [imageUrl, setImageUrl] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setCategory('Ethnic Trends');
    setAuthor('Bhavya Fashions Editorial');
    setImageUrl('');
    setExcerpt('');
    setContent('');
    setErrorMsg(null);
    setModalOpen(true);
  };

  const openEditModal = (b: BlogPost) => {
    setEditingId(b.id);
    setTitle(b.title);
    setSlug(b.slug);
    setCategory(b.category || 'Ethnic Trends');
    setAuthor(b.author || 'Bhavya Fashions Editorial');
    setImageUrl(b.image_url || '');
    setExcerpt(b.excerpt || '');
    setContent(b.content || '');
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    try {
      const res = await fetch(`/api/blogs?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setBlogs(prev => prev.filter(b => b.id !== id));
      }
    } catch (err) {
      alert('Failed to delete blog post');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Blog title is required');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const payload = {
        id: editingId || undefined,
        title: title.trim(),
        slug: slug.trim() || undefined,
        category: category.trim(),
        author: author.trim(),
        image_url: imageUrl || '/images/hero-trio-festive.jpg',
        excerpt: excerpt.trim() || undefined,
        content: content.trim(),
      };

      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save blog post');

      if (editingId) {
        setBlogs(prev => prev.map(b => b.id === editingId ? data.blog : b));
      } else {
        setBlogs(prev => [data.blog, ...prev]);
      }

      setModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving blog post');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#722F37] font-bold">
            Content &amp; Editorial Management
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1C1917]">
            Blog Posts &amp; Articles ({blogs.length})
          </h1>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#722F37] text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-[#5C1D24] transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Write New Article</span>
        </button>
      </div>

      {/* Blogs List */}
      <div className="space-y-4">
        {blogs.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-2xl border border-[#E7E0D5] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
          >
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-xl bg-[#FAF7F2] border border-[#E7E0D5] overflow-hidden shrink-0">
                <img
                  src={b.image_url || '/images/hero-trio-festive.jpg'}
                  alt={b.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#FAF7F2] text-[#722F37] border border-[#E7E0D5]">
                    {b.category || 'Article'}
                  </span>
                  <span className="text-xs text-[#78716C] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>
                      {new Date(b.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </span>
                  <span className="text-xs text-[#78716C]">• {b.author}</span>
                </div>

                <h3 className="font-serif-luxury text-base sm:text-lg font-bold text-[#1C1917]">
                  {b.title}
                </h3>

                <p className="text-xs text-[#57534E] line-clamp-2 leading-relaxed">
                  {b.excerpt || b.content.replace(/<[^>]+>/g, '').slice(0, 140)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-[#F3ECE2]">
              <Link
                href={`/blog/${b.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#E7E0D5] text-[#1C1917] hover:bg-[#EFE9E0] text-xs font-semibold"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View</span>
              </Link>

              <button
                type="button"
                onClick={() => openEditModal(b)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#E7E0D5] text-[#1C1917] hover:bg-[#EFE9E0] text-xs font-semibold"
              >
                <Edit2 className="w-3.5 h-3.5 text-[#722F37]" />
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={() => handleDelete(b.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg text-xs"
                title="Delete article"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#E7E0D5] space-y-4 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E0D5]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#722F37]" />
                <h3 className="font-serif-luxury text-lg font-bold text-[#1C1917]">
                  {editingId ? 'Edit Blog Article' : 'Write New Blog Article'}
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
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!editingId && !slug) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50));
                    }
                  }}
                  placeholder="e.g. 2026 Festive Ethnic Trends: What Retailers Need in Stock"
                  className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#722F37]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Slug (URL)
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))}
                    placeholder="e.g. 2026-festive-trends"
                    className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs py-2 px-2.5 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2]"
                  >
                    <option value="Ethnic Trends">Ethnic Trends</option>
                    <option value="Retail Merchandising">Retail Merchandising</option>
                    <option value="Fabric Know-how">Fabric Know-how</option>
                    <option value="Wedding Season">Wedding Season</option>
                    <option value="Barabazar Market Guide">Barabazar Market Guide</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Author
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Bhavya Fashions Editorial"
                    className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2]"
                  />
                </div>
              </div>

              {/* Cover Image Upload (<50KB High Resolution) */}
              <div>
                <ImageUploadDropzone
                  value={imageUrl}
                  onChange={(url) => setImageUrl(url)}
                  label="Article Banner Image (Auto < 50KB High-Res)"
                  helperText="Upload any local photo from your system. We automatically optimize it under 50KB with pristine resolution."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                  Short Excerpt
                </label>
                <input
                  type="text"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="A concise summary for article cards and Google search..."
                  className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                  Article Body (HTML or Text) *
                </label>
                <textarea
                  rows={8}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write or paste your article content here..."
                  className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] font-mono focus:bg-white focus:outline-none focus:border-[#722F37]"
                />
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
                  <span>{editingId ? 'Save Changes' : 'Publish Article'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
