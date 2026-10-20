'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Catalog } from '@/types';
import {
  PlusCircle,
  Search,
  ExternalLink,
  Copy,
  Check,
  MessageCircle,
  Clock,
  Eye,
  ShieldAlert,
  RotateCcw,
  Share2,
  History,
  Edit,
  X,
  TrendingUp,
  Link2,
  Trash2,
} from 'lucide-react';

interface CatalogsListViewProps {
  initialCatalogs: Catalog[];
}

export function CatalogsListView({ initialCatalogs }: CatalogsListViewProps) {
  const [catalogs, setCatalogs] = useState<Catalog[]>(initialCatalogs);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'revoked'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [historyModalCatalog, setHistoryModalCatalog] = useState<Catalog | null>(null);

  // Overall metrics
  const totalCatalogs = catalogs.length;
  const totalShares = catalogs.reduce((sum, c) => sum + (c.share_count || 0), 0);
  const totalViews = catalogs.reduce((sum, c) => sum + (c.views_count || 0), 0);
  const activeCount = catalogs.filter((c) => c.status === 'active').length;

  const filteredCatalogs = catalogs.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchToken = c.public_token.toLowerCase().includes(q);
      const matchCustomer = c.customer?.business_name.toLowerCase().includes(q);
      if (!matchTitle && !matchToken && !matchCustomer) return false;
    }
    return true;
  });

  const trackShare = async (catalogId: string, channel: 'copy_link' | 'whatsapp') => {
    try {
      fetch('/api/catalogs/track-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ catalogId, channel }),
      }).catch(() => {});

      const now = new Date().toISOString();
      const newEvent = {
        id: `share-${Date.now()}`,
        timestamp: now,
        channel,
      };

      setCatalogs((prev) =>
        prev.map((c) => {
          if (c.id === catalogId) {
            return {
              ...c,
              share_count: (c.share_count || 0) + 1,
              share_history: [newEvent, ...(c.share_history || [])],
            };
          }
          return c;
        })
      );
    } catch {}
  };

  const handleCopyLink = (token: string, id: string, accessCode?: string | null) => {
    const url = accessCode
      ? `${window.location.origin}/catalog/${token}?code=${encodeURIComponent(accessCode)}`
      : `${window.location.origin}/catalog/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    trackShare(id, 'copy_link');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this catalog link? Customers will no longer be able to submit inquiries.')) return;
    setCatalogs((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'revoked' } : c)));
  };

  const handleDeleteCatalog = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete custom catalogue "${title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch('/api/catalogs/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete catalog');
      setCatalogs((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error deleting catalog');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#722F37] font-bold">
            Catalog Management &amp; Share Analytics
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1C1917]">
            Active &amp; Issued Catalogs
          </h1>
        </div>

        <Link
          href="/admin/catalogs/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#722F37] text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-[#5C1D24]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Catalog</span>
        </Link>
      </div>

      {/* Aggregate Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E7E0D5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#78716C] uppercase tracking-wider">Total Catalogs</span>
            <Link2 className="w-4 h-4 text-[#722F37]" />
          </div>
          <span className="text-2xl font-bold text-[#1C1917] mt-1 block font-mono">{totalCatalogs}</span>
          <span className="text-[10px] text-zinc-400">{activeCount} active currently</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E7E0D5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#78716C] uppercase tracking-wider">Total Links Shared</span>
            <Share2 className="w-4 h-4 text-[#25D366]" />
          </div>
          <span className="text-2xl font-bold text-[#722F37] mt-1 block font-mono">{totalShares}</span>
          <span className="text-[10px] text-zinc-400">Via WhatsApp &amp; direct links</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E7E0D5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#78716C] uppercase tracking-wider">Total Buyer Views</span>
            <Eye className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-bold text-[#1C1917] mt-1 block font-mono">{totalViews}</span>
          <span className="text-[10px] text-zinc-400">Unique lookbook impressions</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E7E0D5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#78716C] uppercase tracking-wider">Active Links</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block font-mono">{activeCount}</span>
          <span className="text-[10px] text-zinc-400">Ready for buyer inquiries</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E0D5] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by catalog title, token or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2]"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'active', 'expired', 'revoked'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${
                statusFilter === st
                  ? 'bg-[#722F37] text-white'
                  : 'bg-[#FAF7F2] text-[#78716C] hover:bg-[#EFE9E0]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Cards List */}
      <div className="space-y-4">
        {filteredCatalogs.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-2xl border border-[#E7E0D5] p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold bg-[#FAF7F2] px-2 py-0.5 rounded border text-[#722F37]">
                  /{cat.public_token}
                </span>

                {cat.access_code && (
                  <span className="font-mono text-[10px] font-bold bg-[#FAF0E6] text-[#722F37] border border-[#E7D6C4] px-2 py-0.5 rounded flex items-center gap-1">
                    Passcode: {cat.access_code}
                  </span>
                )}

                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    cat.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : cat.status === 'expired'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {cat.status}
                </span>

                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#F3ECE2] text-[#44403C]">
                  Mode: {cat.mode}
                </span>
              </div>

              <h3 className="font-serif-luxury text-lg font-bold text-[#1C1917]">
                {cat.title}
              </h3>

              <div className="flex items-center gap-4 text-xs text-[#78716C] flex-wrap">
                {cat.customer && (
                  <span>
                    Customer: <strong className="text-[#1C1917]">{cat.customer.business_name}</strong>
                  </span>
                )}
                <span>Created: {new Date(cat.created_at).toLocaleDateString('en-IN')}</span>
                {cat.expires_at && (
                  <span className="flex items-center gap-1 text-amber-800">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Expires: {new Date(cat.expires_at).toLocaleDateString('en-IN')}</span>
                  </span>
                )}
                <span className="flex items-center gap-1 text-blue-700 font-semibold">
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>{cat.views_count || 0} views</span>
                </span>

                {/* Share Count Badge with History Modal Trigger */}
                <button
                  type="button"
                  onClick={() => setHistoryModalCatalog(cat)}
                  className="flex items-center gap-1 text-emerald-800 font-semibold hover:underline cursor-pointer"
                  title="View Share History"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{cat.share_count || 0} shared</span>
                  <History className="w-3 h-3 text-zinc-400 ml-0.5" />
                </button>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-2 flex-wrap lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-[#F3ECE2]">
              {/* Edit Catalog Button */}
              <Link
                href={`/admin/catalogs/create?id=${cat.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E7E0D5] text-xs font-bold uppercase tracking-wider text-[#1C1917] hover:bg-[#EFE9E0]"
              >
                <Edit className="w-3.5 h-3.5 text-[#722F37]" />
                <span>Edit</span>
              </Link>

              {/* Copy Link Button */}
              <button
                type="button"
                onClick={() => handleCopyLink(cat.public_token, cat.id, cat.access_code)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E7E0D5] text-xs font-bold uppercase tracking-wider text-[#1C1917] hover:bg-[#EFE9E0]"
              >
                {copiedId === cat.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === cat.id ? 'Copied' : 'Copy Link'}</span>
              </button>

              {/* WhatsApp Share Button */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  cat.access_code
                    ? `Hello! Here is your exclusive Bhavya Fashions wholesale lookbook: ${typeof window !== 'undefined' ? window.location.origin : ''}/catalog/${cat.public_token}?code=${cat.access_code} (Passcode: ${cat.access_code})`
                    : `Hello! Here is your Bhavya Fashions wholesale lookbook: ${typeof window !== 'undefined' ? window.location.origin : ''}/catalog/${cat.public_token}`
                )}`}
                onClick={() => trackShare(cat.id, 'whatsapp')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#20ba59]"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>

              {/* Preview Button */}
              <Link
                href={`/catalog/${cat.public_token}${cat.access_code ? `?code=${encodeURIComponent(cat.access_code)}` : ''}`}
                target="_blank"
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#722F37] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5C1D24]"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Preview</span>
              </Link>

              {cat.status === 'active' && (
                <button
                  type="button"
                  onClick={() => handleRevoke(cat.id)}
                  className="p-2 text-xs text-amber-700 hover:bg-amber-50 rounded-lg border border-amber-200"
                  title="Revoke access"
                >
                  <ShieldAlert className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => handleDeleteCatalog(cat.id, cat.title)}
                className="p-2 text-xs text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
                title="Delete Custom Link Catalog"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Share History Modal */}
      {historyModalCatalog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E7E0D5] space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E0D5]">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#722F37]" />
                <h3 className="font-serif-luxury text-base font-bold text-[#1C1917]">
                  Share History: {historyModalCatalog.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setHistoryModalCatalog(null)}
                className="p-1 text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {historyModalCatalog.share_history && historyModalCatalog.share_history.length > 0 ? (
                historyModalCatalog.share_history.map((ev, i) => (
                  <div
                    key={ev.id || i}
                    className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E7E0D5] text-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {ev.channel === 'whatsapp' ? (
                        <MessageCircle className="w-4 h-4 text-[#25D366]" />
                      ) : (
                        <Copy className="w-4 h-4 text-[#722F37]" />
                      )}
                      <span className="font-semibold text-[#1C1917] capitalize">
                        {ev.channel.replace('_', ' ')}
                      </span>
                    </div>

                    <span className="text-[11px] text-[#78716C] font-mono">
                      {new Date(ev.timestamp).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-[#78716C]">
                  {historyModalCatalog.share_count && historyModalCatalog.share_count > 0 ? (
                    <p>Catalog has been shared {historyModalCatalog.share_count} times.</p>
                  ) : (
                    <p>No share activity recorded yet. Click Copy Link or WhatsApp to share.</p>
                  )}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setHistoryModalCatalog(null)}
                className="px-4 py-2 rounded-lg bg-[#722F37] text-white text-xs font-bold uppercase tracking-wider"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
