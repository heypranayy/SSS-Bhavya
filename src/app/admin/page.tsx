import React from 'react';
import Link from 'next/link';
import { getAllProducts, getCollections } from '@/lib/repository/products';
import { getAllCatalogs } from '@/lib/repository/catalogs';
import { getAllInquiries } from '@/lib/repository/inquiries';
import { formatINR } from '@/lib/utils';
import {
  Layers,
  BookOpen,
  FolderTree,
  MessageSquare,
  Eye,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Dashboard | Bhavya Fashions',
};

export default async function AdminDashboardPage() {
  const [products, collections, catalogs, inquiries] = await Promise.all([
    getAllProducts(),
    getCollections(),
    getAllCatalogs(),
    getAllInquiries(),
  ]);

  const activeProducts = products.filter(p => p.is_active).length;
  const activeCatalogs = catalogs.filter(c => c.status === 'active').length;
  const expiredCatalogs = catalogs.filter(c => c.status === 'expired').length;
  const totalViews = catalogs.reduce((sum, c) => sum + (c.views_count || 0), 0);
  const newInquiries = inquiries.filter(i => i.status === 'new').length;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#722F37] font-bold">
            Live Overview
          </span>
          <h1 className="font-serif-luxury text-3xl font-bold text-[#1C1917] mt-0.5">
            Wholesale Operations Center
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/catalogs/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#722F37] text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-[#5C1D24] transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Generate New Catalog</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Link
          href="/admin/products"
          className="bg-white p-5 rounded-xl border border-[#E7E0D5] shadow-xs flex items-center gap-4 hover:border-[#722F37] hover:shadow-md transition-all cursor-pointer group"
          title="Manage Product Database"
        >
          <div className="w-12 h-12 rounded-lg bg-[#722F37]/10 text-[#722F37] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-[#78716C] uppercase font-semibold block group-hover:text-[#722F37] transition-colors">
              Active Products
            </span>
            <span className="text-2xl font-extrabold text-[#1C1917]">{activeProducts}</span>
          </div>
        </Link>

        <Link
          href="/admin/catalogs"
          className="bg-white p-5 rounded-xl border border-[#E7E0D5] shadow-xs flex items-center gap-4 hover:border-[#9E7D3B] hover:shadow-md transition-all cursor-pointer group"
          title="Manage Wholesale Catalogs"
        >
          <div className="w-12 h-12 rounded-lg bg-[#C5A059]/15 text-[#9E7D3B] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-[#78716C] uppercase font-semibold block group-hover:text-[#9E7D3B] transition-colors">
              Active Catalogs
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#1C1917]">{activeCatalogs}</span>
              {expiredCatalogs > 0 && (
                <span className="text-[10px] text-amber-700">({expiredCatalogs} expired)</span>
              )}
            </div>
          </div>
        </Link>

        <Link
          href="/admin/inquiries"
          className="bg-white p-5 rounded-xl border border-[#E7E0D5] shadow-xs flex items-center gap-4 hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer group"
          title="View All Wholesale Inquiries"
        >
          <div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-[#78716C] uppercase font-semibold block group-hover:text-emerald-700 transition-colors">
              Total Inquiries
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#1C1917]">{inquiries.length}</span>
              {newInquiries > 0 && (
                <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-bold">
                  {newInquiries} New
                </span>
              )}
            </div>
          </div>
        </Link>

        <Link
          href="/admin/catalogs"
          className="bg-white p-5 rounded-xl border border-[#E7E0D5] shadow-xs flex items-center gap-4 hover:border-blue-600 hover:shadow-md transition-all cursor-pointer group"
          title="View Catalog Analytics"
        >
          <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-[#78716C] uppercase font-semibold block group-hover:text-blue-700 transition-colors">
              Catalog Views
            </span>
            <span className="text-2xl font-extrabold text-[#1C1917]">{totalViews}</span>
          </div>
        </Link>
      </div>

      {/* Two Column Layout: Recent Inquiries & Active Catalogs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Inquiries List */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E7E0D5] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F3ECE2]">
            <h2 className="font-serif-luxury text-lg font-bold text-[#1C1917]">
              Recent Wholesale Inquiries
            </h2>
            <Link
              href="/admin/inquiries"
              className="text-xs font-bold text-[#722F37] uppercase tracking-wider hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#F3ECE2]">
            {inquiries.slice(0, 5).map((inq) => {
              const totalItemsCount = inq.items.reduce((s, i) => s + i.total_quantity, 0);
              const totalValue = inq.items.reduce((s, i) => s + i.indicative_subtotal, 0);

              return (
                <Link
                  key={inq.id}
                  href="/admin/inquiries"
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF7F2] px-3 -mx-3 rounded-xl transition-colors cursor-pointer group"
                  title="View inquiry details"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#722F37] group-hover:underline">
                        {inq.reference_no}
                      </span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        inq.status === 'new' ? 'bg-red-100 text-red-700' :
                        inq.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                        inq.status === 'follow_up' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {inq.status}
                      </span>
                    </div>

                    <h4 className="font-semibold text-xs text-[#1C1917] mt-1 group-hover:text-[#722F37] transition-colors">
                      {inq.business_name} ({inq.buyer_name})
                    </h4>
                    <p className="text-[11px] text-[#78716C]">
                      {inq.city || 'India'} • Phone: {inq.phone}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-xs font-bold text-[#1C1917] block">
                      {totalItemsCount} pieces ({inq.items.length} designs)
                    </span>
                    <span className="text-xs font-extrabold text-[#722F37]">
                      {formatINR(totalValue)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Launch & Active Catalogs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E7E0D5] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F3ECE2]">
              <h2 className="font-serif-luxury text-lg font-bold text-[#1C1917]">
                Active Private Catalogs
              </h2>
              <Link
                href="/admin/catalogs"
                className="text-xs font-bold text-[#722F37] uppercase tracking-wider hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {catalogs.slice(0, 4).map((cat) => (
                <div key={cat.id} className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E7E0D5] space-y-1.5 hover:border-[#C5A059] transition-all">
                  <div className="flex items-center justify-between">
                    <Link
                      href="/admin/catalogs"
                      className="font-bold text-xs text-[#1C1917] line-clamp-1 hover:text-[#722F37]"
                    >
                      {cat.title}
                    </Link>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                      {cat.mode}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#78716C]">
                    <span>Token: <span className="font-mono text-[#722F37]">{cat.public_token}</span></span>
                    <span>{cat.views_count || 0} views</span>
                  </div>
                  <div className="pt-1 flex items-center justify-between">
                    <Link
                      href={`/catalog/${cat.public_token}`}
                      target="_blank"
                      className="text-[11px] text-[#722F37] font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <span>Open Lookbook</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>

                    <Link
                      href="/admin/catalogs"
                      className="text-[10px] text-zinc-500 hover:text-zinc-900 font-medium"
                    >
                      Settings →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link
                href="/admin/catalogs"
                className="w-full text-center py-2 text-xs font-bold text-[#722F37] uppercase tracking-wider block hover:underline"
              >
                Manage All Catalogs →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
