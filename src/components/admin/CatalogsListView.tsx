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
} from 'lucide-react';

interface CatalogsListViewProps {
  initialCatalogs: Catalog[];
}

export function CatalogsListView({ initialCatalogs }: CatalogsListViewProps) {
  const [catalogs, setCatalogs] = useState<Catalog[]>(initialCatalogs);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'revoked'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredCatalogs = catalogs.filter(c => {
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

  const handleCopyLink = (token: string, id: string) => {
    const url = `${window.location.origin}/catalog/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this catalog link? Customers will no longer be able to submit inquiries.')) return;
    setCatalogs(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked' } : c));
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#722F37] font-bold">
            Catalog Management
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1C1917]">
            Active & Issued Catalogs
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
                  {cat.public_token}
                </span>

                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  cat.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                  cat.status === 'expired' ? 'bg-amber-100 text-amber-800' :
                  'bg-red-100 text-red-800'
                }`}>
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
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>{cat.views_count || 0} views</span>
                </span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-2 flex-wrap lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-[#F3ECE2]">
              <button
                type="button"
                onClick={() => handleCopyLink(cat.public_token, cat.id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E7E0D5] text-xs font-bold uppercase tracking-wider text-[#1C1917] hover:bg-[#EFE9E0]"
              >
                {copiedId === cat.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === cat.id ? 'Copied' : 'Copy Link'}</span>
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Here is your wholesale kurti catalog from Bhavya Fashions: ${window.location.origin}/catalog/${cat.public_token}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#20ba59]"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>

              <Link
                href={`/catalog/${cat.public_token}`}
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
                  className="p-2 text-xs text-red-600 hover:bg-red-50 rounded-lg"
                  title="Revoke access"
                >
                  <ShieldAlert className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
