'use client';

import React, { useState } from 'react';
import { Inquiry, InquiryStatus } from '@/types';
import { formatINR } from '@/lib/utils';
import { updateInquiryStatus } from '@/lib/repository/inquiries';
import {
  MessageSquare,
  Search,
  Phone,
  PhoneCall,
  CheckCircle2,
  Clock,
  Download,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface InquiriesManagerProps {
  initialInquiries: Inquiry[];
}

export function InquiriesManager({ initialInquiries }: InquiriesManagerProps) {
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);
  const [statusFilter, setStatusFilter] = useState<'all' | InquiryStatus>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(initialInquiries[0]?.id || null);

  const filteredInquiries = inquiries.filter(i => {
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchRef = i.reference_no.toLowerCase().includes(q);
      const matchBuyer = i.buyer_name.toLowerCase().includes(q);
      const matchBusiness = i.business_name.toLowerCase().includes(q);
      const matchPhone = i.phone.includes(q);
      if (!matchRef && !matchBuyer && !matchBusiness && !matchPhone) return false;
    }
    return true;
  });

  const handleStatusChange = async (inquiryId: string, newStatus: InquiryStatus) => {
    setInquiries(prev =>
      prev.map(i => (i.id === inquiryId ? { ...i, status: newStatus } : i))
    );
    await updateInquiryStatus(inquiryId, newStatus);
  };

  const handleNotesChange = async (inquiryId: string, notes: string) => {
    setInquiries(prev =>
      prev.map(i => (i.id === inquiryId ? { ...i, internal_notes: notes } : i))
    );
    await updateInquiryStatus(inquiryId, inquiries.find(i => i.id === inquiryId)?.status || 'new', notes);
  };

  const handleExportCSV = () => {
    const headers = ['Reference_No', 'Buyer_Name', 'Business_Name', 'Phone', 'City', 'Status', 'Total_Qty', 'Subtotal_INR', 'Date'];
    const rows = filteredInquiries.map(i => {
      const totalQty = i.items.reduce((s, it) => s + it.total_quantity, 0);
      const subtotal = i.items.reduce((s, it) => s + it.indicative_subtotal, 0);
      return [
        i.reference_no,
        `"${i.buyer_name}"`,
        `"${i.business_name}"`,
        `"${i.phone}"`,
        `"${i.city || ''}"`,
        i.status,
        totalQty,
        subtotal,
        new Date(i.created_at).toISOString().slice(0, 10),
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bhavya_fashions_inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
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
            Procurement Pipeline
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1C1917]">
            Wholesale Customer Inquiries ({inquiries.length})
          </h1>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#E7E0D5] text-xs font-bold uppercase tracking-wider text-[#1C1917] hover:bg-[#FAF7F2] self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Inquiries CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E0D5] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by inquiry ref, boutique or buyer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'new', 'contacted', 'follow_up', 'closed'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase whitespace-nowrap transition-colors ${
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

      {/* Inquiries Cards List */}
      <div className="space-y-4">
        {filteredInquiries.map((inq) => {
          const totalPieces = inq.items.reduce((s, it) => s + it.total_quantity, 0);
          const totalSubtotal = inq.items.reduce((s, it) => s + it.indicative_subtotal, 0);
          const isExpanded = expandedId === inq.id;

          const whatsappMessage = encodeURIComponent(
            `Hello ${inq.buyer_name} ji (${inq.business_name}), this is Bhavya Fashions regarding your wholesale requirement ${inq.reference_no} (${totalPieces} pieces). We have reviewed your size ratio breakdown and ready stocks.`
          );

          return (
            <div
              key={inq.id}
              className="bg-white rounded-2xl border border-[#E7E0D5] overflow-hidden shadow-xs"
            >
              {/* Summary Row */}
              <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#722F37] bg-[#FAF7F2] px-2 py-0.5 rounded border">
                      {inq.reference_no}
                    </span>

                    <select
                      value={inq.status}
                      onChange={(e) => handleStatusChange(inq.id, e.target.value as InquiryStatus)}
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border focus:outline-none ${
                        inq.status === 'new' ? 'bg-red-50 text-red-700 border-red-200' :
                        inq.status === 'contacted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        inq.status === 'follow_up' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      <option value="new">● New</option>
                      <option value="contacted">● Contacted</option>
                      <option value="follow_up">● Follow-up</option>
                      <option value="closed">● Closed</option>
                    </select>

                    <span className="text-[11px] text-[#78716C]">
                      Received: {new Date(inq.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h3 className="font-serif-luxury text-base font-bold text-[#1C1917]">
                    {inq.business_name} — {inq.buyer_name}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-[#78716C] flex-wrap">
                    <span className="font-mono">{inq.phone}</span>
                    {inq.city && <span>{inq.city}, {inq.state}</span>}
                    {inq.email && <span>{inq.email}</span>}
                  </div>
                </div>

                {/* Right Summary & CTAs */}
                <div className="flex items-center gap-3 flex-wrap lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-[#F3ECE2]">
                  <div className="text-left lg:text-right mr-2">
                    <span className="text-xs font-bold text-[#1C1917] block">
                      {totalPieces} Pieces ({inq.items.length} Designs)
                    </span>
                    <span className="text-sm font-extrabold text-[#722F37]">
                      {formatINR(totalSubtotal)}
                    </span>
                  </div>

                  <a
                    href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#20ba59] shadow-2xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : inq.id)}
                    className="p-2 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] text-[#78716C] hover:text-[#1C1917]"
                    title="Toggle breakdown"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded Itemized Breakdown */}
              {isExpanded && (
                <div className="border-t border-[#F3ECE2] bg-[#FAF7F2]/50 p-5 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                    Itemized Product & Size Ratio Breakdown:
                  </h4>

                  <div className="space-y-3">
                    {inq.items.map((it, idx) => (
                      <div
                        key={it.id || idx}
                        className="bg-white p-3.5 rounded-xl border border-[#E7E0D5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          {it.product_image_url && (
                            <img
                              src={it.product_image_url}
                              alt=""
                              className="w-12 h-14 object-cover rounded bg-[#EFE9E0] shrink-0"
                            />
                          )}
                          <div>
                            <span className="font-mono font-bold text-[#722F37] text-xs">
                              {it.product_code}
                            </span>
                            <h5 className="font-semibold text-[#1C1917] mt-0.5">{it.product_title}</h5>
                            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#78716C]">
                              <span className="font-medium text-[#1C1917]">Sizes:</span>
                              {Object.entries(it.size_breakdown || {}).map(([sz, qty]) => (
                                <span key={sz} className="bg-[#FAF7F2] border px-1.5 py-0.2 rounded font-mono font-bold">
                                  {sz}: {String(qty)}
                                </span>
                              ))}
                            </div>
                            {it.notes && (
                              <p className="text-[11px] text-[#722F37] italic mt-1">
                                Note: "{it.notes}"
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                          <span className="text-[#78716C] block">
                            {formatINR(it.quoted_price)} × {it.total_quantity} pcs
                          </span>
                          <span className="font-extrabold text-[#722F37] text-sm">
                            {formatINR(it.indicative_subtotal)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {inq.message && (
                    <div className="p-3 bg-white rounded-lg border border-[#E7E0D5] text-xs space-y-1">
                      <span className="font-bold text-[#1C1917]">Buyer's Transport & Dispatch Instructions:</span>
                      <p className="text-[#57534E]">{inq.message}</p>
                    </div>
                  )}

                  {/* Internal Notes */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-[#1C1917] mb-1">
                      Internal Admin Notes
                    </label>
                    <input
                      type="text"
                      placeholder="Add follow-up notes (e.g. Quoted transport via V-Trans, advance token expected)..."
                      defaultValue={inq.internal_notes || ''}
                      onBlur={(e) => handleNotesChange(inq.id, e.target.value)}
                      className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-white"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
