'use client';

import React, { useState } from 'react';
import { Inquiry, InquiryStatus, InquiryType } from '@/types';
import { formatINR } from '@/lib/utils';
import { updateInquiryStatus, assignInquiryStaff } from '@/lib/repository/inquiries';
import {
  MessageSquare,
  Globe,
  BookOpen,
  Search,
  Phone,
  PhoneCall,
  CheckCircle2,
  Clock,
  Download,
  Check,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Building2,
  MapPin,
  ExternalLink,
  Sparkles,
  PlusCircle,
  Trash2,
  X,
  Loader2,
} from 'lucide-react';

interface InquiriesManagerProps {
  initialInquiries: Inquiry[];
}

const STAFF_MEMBERS = [
  'Unassigned',
  'Amit Verma (Kolkata Sales)',
  'Sanjay Jain (B2B Dispatch)',
  'Ravi Sharma (Surat Desk)',
  'Neha Agarwal (VIP Accounts)'
];

export function InquiriesManager({ initialInquiries }: InquiriesManagerProps) {
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);
  const [activeTab, setActiveTab] = useState<'all' | 'website' | 'catalog' | 'price_request'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | InquiryStatus>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(initialInquiries[0]?.id || null);

  // Manual Inquiry Modal State
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualBuyer, setManualBuyer] = useState('');
  const [manualBusiness, setManualBusiness] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualCity, setManualCity] = useState('Kolkata');
  const [manualState, setManualState] = useState('West Bengal');
  const [manualProductCode, setManualProductCode] = useState('DN11059');
  const [manualProductTitle, setManualProductTitle] = useState('11059 Kurti Pant Dupatta');
  const [manualQty, setManualQty] = useState('12');
  const [manualPrice, setManualPrice] = useState('650');
  const [manualStaff, setManualStaff] = useState('Amit Verma (Kolkata Sales)');
  const [manualMessage, setManualMessage] = useState('Boutique phone order recorded manually.');
  const [isSavingManual, setIsSavingManual] = useState(false);

  const websiteInquiriesCount = inquiries.filter(i => i.inquiry_type === 'website').length;
  const catalogInquiriesCount = inquiries.filter(i => i.inquiry_type === 'catalog' && !i.reference_no.startsWith('BF-REQ')).length;
  const priceRequestsCount = inquiries.filter(i => i.inquiry_type === 'price_request' || i.reference_no.startsWith('BF-REQ')).length;

  const filteredInquiries = inquiries.filter(i => {
    // Type tab filter
    if (activeTab === 'website' && i.inquiry_type !== 'website') return false;
    if (activeTab === 'catalog' && (i.inquiry_type !== 'catalog' || i.reference_no.startsWith('BF-REQ'))) return false;
    if (activeTab === 'price_request' && (i.inquiry_type !== 'price_request' && !i.reference_no.startsWith('BF-REQ'))) return false;

    // Status filter
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchRef = i.reference_no.toLowerCase().includes(q);
      const matchBuyer = i.buyer_name.toLowerCase().includes(q);
      const matchBusiness = i.business_name.toLowerCase().includes(q);
      const matchPhone = i.phone.includes(q);
      const matchCity = (i.city || '').toLowerCase().includes(q);
      if (!matchRef && !matchBuyer && !matchBusiness && !matchPhone && !matchCity) return false;
    }
    return true;
  });

  const handleStatusChange = async (inquiryId: string, newStatus: InquiryStatus) => {
    setInquiries(prev =>
      prev.map(i => (i.id === inquiryId ? { ...i, status: newStatus } : i))
    );
    await updateInquiryStatus(inquiryId, newStatus);
  };

  const handleStaffChange = async (inquiryId: string, newStaff: string) => {
    setInquiries(prev =>
      prev.map(i => (i.id === inquiryId ? { ...i, assigned_staff: newStaff } : i))
    );
    await assignInquiryStaff(inquiryId, newStaff);
  };

  const handleNotesChange = async (inquiryId: string, notes: string) => {
    setInquiries(prev =>
      prev.map(i => (i.id === inquiryId ? { ...i, internal_notes: notes } : i))
    );
    await updateInquiryStatus(inquiryId, inquiries.find(i => i.id === inquiryId)?.status || 'new', notes);
  };

  const handleCreateManualInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBuyer.trim() || !manualPhone.trim()) {
      alert('Please fill in buyer name and phone number.');
      return;
    }

    setIsSavingManual(true);
    try {
      const qty = Number(manualQty) || 6;
      const rate = Number(manualPrice) || 650;
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiry_type: 'catalog',
          buyer_name: manualBuyer.trim(),
          business_name: manualBusiness.trim() || 'Direct Boutique Client',
          phone: manualPhone.trim(),
          email: manualEmail.trim() || undefined,
          city: manualCity.trim(),
          state: manualState.trim(),
          message: manualMessage.trim(),
          source_page: '/admin/inquiries',
          items: [
            {
              product_id: 'p-migrated-29589',
              size_breakdown: { M: Math.ceil(qty / 4), L: Math.ceil(qty / 4), XL: Math.ceil(qty / 4), XXL: Math.floor(qty / 4) },
              notes: `${manualProductCode} - ${manualProductTitle}`,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record manual inquiry');

      const newInq: Inquiry = {
        id: data.inquiry_id || `inq-${Date.now()}`,
        reference_no: data.reference_no || `BF-MAN-${Math.floor(10000 + Math.random() * 90000)}`,
        inquiry_type: 'catalog',
        buyer_name: manualBuyer.trim(),
        business_name: manualBusiness.trim() || 'Direct Boutique Client',
        phone: manualPhone.trim(),
        email: manualEmail.trim() || undefined,
        city: manualCity.trim(),
        state: manualState.trim(),
        assigned_staff: manualStaff,
        message: manualMessage.trim(),
        status: 'new',
        internal_notes: 'Created manually by sales admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: [
          {
            id: `item-${Date.now()}`,
            product_id: 'p-migrated-29589',
            product_code: manualProductCode,
            product_title: manualProductTitle,
            quoted_price: rate,
            size_breakdown: { M: Math.ceil(qty / 4), L: Math.ceil(qty / 4), XL: Math.ceil(qty / 4), XXL: Math.floor(qty / 4) },
            total_quantity: qty,
            indicative_subtotal: qty * rate,
            notes: 'Manual entry',
          },
        ],
      };

      setInquiries(prev => [newInq, ...prev]);
      setManualModalOpen(false);
      setManualBuyer('');
      setManualBusiness('');
      setManualPhone('');
    } catch (err: any) {
      alert(err.message || 'Error creating manual inquiry');
    } finally {
      setIsSavingManual(false);
    }
  };

  const handleDeleteInquiry = async (id: string, ref: string) => {
    if (!confirm(`Are you sure you want to delete inquiry "${ref}"?`)) return;
    try {
      const res = await fetch('/api/inquiries', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete inquiry');
      setInquiries(prev => prev.filter(i => i.id !== id && i.reference_no !== id));
    } catch (err: any) {
      alert(err.message || 'Error deleting inquiry');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Reference_No', 'Type', 'Buyer_Name', 'Business_Name', 'Phone', 'City', 'State', 'Source_Page', 'Assigned_Staff', 'Status', 'Total_Qty', 'Subtotal_INR', 'Date'];
    const rows = filteredInquiries.map(i => {
      const totalQty = (i.items || []).reduce((s, it) => s + it.total_quantity, 0);
      const subtotal = (i.items || []).reduce((s, it) => s + it.indicative_subtotal, 0);
      return [
        i.reference_no,
        i.inquiry_type || 'catalog',
        `"${i.buyer_name}"`,
        `"${i.business_name}"`,
        `"${i.phone}"`,
        `"${i.city || ''}"`,
        `"${i.state || ''}"`,
        `"${i.source_page || ''}"`,
        `"${i.assigned_staff || 'Unassigned'}"`,
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
    link.setAttribute('download', `bhavya_fashions_${activeTab}_inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
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
            B2B Procurement & Routing
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1C1917]">
            Wholesale Inquiries Management
          </h1>
          <p className="text-xs text-[#78716C] mt-1">
            Clearly separated website general inquiries and catalog-specific procurement forms with staff assignment and status tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setManualModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#722F37] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5b242b] shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>+ Record Manual Inquiry</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#E7E0D5] text-xs font-bold uppercase tracking-wider text-[#1C1917] hover:bg-[#FAF7F2] shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#722F37]" />
            <span>Export {activeTab.toUpperCase()} CSV</span>
          </button>
        </div>
      </div>

      {/* Main Two-Section Tabs: Website Inquiries vs Catalog Inquiries */}
      <div className="flex items-center gap-2 border-b border-[#E7E0D5] pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-[#1C1917] text-white shadow-sm'
              : 'text-[#78716C] hover:bg-[#EFE9E0]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>All Inquiries ({inquiries.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('website')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'website'
              ? 'bg-[#722F37] text-white shadow-sm'
              : 'text-[#78716C] hover:bg-[#EFE9E0]'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Website Inquiries ({websiteInquiriesCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'catalog'
              ? 'bg-[#C5A059] text-white shadow-sm'
              : 'text-[#78716C] hover:bg-[#EFE9E0]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Catalog Inquiries ({catalogInquiriesCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('price_request')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'price_request'
              ? 'bg-[#722F37] text-white shadow-sm'
              : 'text-[#78716C] hover:bg-[#EFE9E0]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#C5A059]" />
          <span>Price Requests ({priceRequestsCount})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E0D5] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ref no, boutique, buyer, phone, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-semibold text-[#78716C] uppercase mr-1">Status:</span>
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
        {filteredInquiries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E7E0D5] p-12 text-center space-y-3">
            <MessageSquare className="w-10 h-10 text-[#C5A059] mx-auto opacity-70" />
            <h3 className="font-serif-luxury text-base font-bold text-[#1C1917]">No inquiries match this criteria</h3>
            <p className="text-xs text-[#78716C]">Try switching the tab or adjusting your search keyword.</p>
          </div>
        ) : (
          filteredInquiries.map((inq) => {
            const isCatalogInquiry = inq.inquiry_type === 'catalog' || (!inq.inquiry_type && inq.items?.length > 0);
            const totalPieces = (inq.items || []).reduce((s, it) => s + it.total_quantity, 0);
            const totalSubtotal = (inq.items || []).reduce((s, it) => s + it.indicative_subtotal, 0);
            const isExpanded = expandedId === inq.id;

            const whatsappMessage = encodeURIComponent(
              isCatalogInquiry
                ? `Hello ${inq.buyer_name} ji (${inq.business_name}), this is Bhavya Fashions regarding your catalog requirement ${inq.reference_no} (${totalPieces} pieces). We have reviewed your size breakdown and ready stock availability.`
                : `Hello ${inq.buyer_name} ji (${inq.business_name}), this is Bhavya Fashions regarding your wholesale inquiry on our website. How can we assist your boutique?`
            );

            return (
              <div
                key={inq.id}
                className={`bg-white rounded-2xl border overflow-hidden shadow-xs transition-all ${
                  isCatalogInquiry ? 'border-[#E7E0D5]' : 'border-amber-200/80 bg-linear-to-r from-white via-white to-amber-50/20'
                }`}
              >
                {/* Summary Row */}
                <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#722F37] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#E7E0D5]">
                        {inq.reference_no}
                      </span>

                      {/* Type Badge */}
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1 ${
                        isCatalogInquiry
                          ? 'bg-[#C5A059]/15 text-[#9E7B34] border border-[#C5A059]/30'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {isCatalogInquiry ? <BookOpen className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                        <span>{isCatalogInquiry ? 'Catalog Lookbook Inquiry' : 'Website Contact Form'}</span>
                      </span>

                      {/* Status Dropdown */}
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
                        {new Date(inq.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h3 className="font-serif-luxury text-base font-bold text-[#1C1917]">
                      {inq.business_name} — {inq.buyer_name}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-[#78716C] flex-wrap">
                      <span className="font-mono font-medium">{inq.phone}</span>
                      {inq.city && <span>📍 {inq.city}, {inq.state}</span>}
                      {inq.email && <span>✉️ {inq.email}</span>}
                      {inq.source_page && (
                        <span className="bg-[#FAF7F2] px-1.5 py-0.5 rounded border text-[11px]">
                          Source: {inq.source_page}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Summary & CTAs */}
                  <div className="flex items-center gap-3 flex-wrap lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-[#F3ECE2]">
                    {isCatalogInquiry && (
                      <div className="text-left lg:text-right mr-2">
                        <span className="text-xs font-bold text-[#1C1917] block">
                          {totalPieces} Pieces ({(inq.items || []).length} Designs)
                        </span>
                        <span className="text-sm font-extrabold text-[#722F37]">
                          {formatINR(totalSubtotal)}
                        </span>
                      </div>
                    )}

                    {/* Staff Assignment Dropdown */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <UserCheck className="w-3.5 h-3.5 text-[#722F37]" />
                      <select
                        value={inq.assigned_staff || 'Unassigned'}
                        onChange={(e) => handleStaffChange(inq.id, e.target.value)}
                        className="text-xs py-1 px-2 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] font-medium"
                      >
                        {STAFF_MEMBERS.map(sm => (
                          <option key={sm} value={sm}>{sm}</option>
                        ))}
                      </select>
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
                      onClick={() => handleDeleteInquiry(inq.id, inq.reference_no)}
                      className="p-2 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      title="Delete inquiry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : inq.id)}
                      className="p-2 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] text-[#78716C] hover:text-[#1C1917]"
                      title="Toggle details"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Itemized Breakdown & Message */}
                {isExpanded && (
                  <div className="border-t border-[#F3ECE2] bg-[#FAF7F2]/60 p-5 space-y-4">
                    {/* If catalog inquiry, display product list */}
                    {isCatalogInquiry && (inq.items || []).length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                          Selected Catalog Designs & Size Breakdown:
                        </h4>

                        <div className="space-y-2">
                          {(inq.items || []).map((it, idx) => (
                            <div
                              key={it.id || idx}
                              className="bg-white p-3 rounded-xl border border-[#E7E0D5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
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
                      </div>
                    )}

                    {/* Customer Message */}
                    {inq.message && (
                      <div className="p-3.5 bg-white rounded-xl border border-[#E7E0D5] text-xs space-y-1">
                        <span className="font-bold text-[#1C1917] block">Customer's Message / Requirement:</span>
                        <p className="text-[#57534E] leading-relaxed">{inq.message}</p>
                      </div>
                    )}

                    {/* Internal Notes */}
                    <div className="pt-2">
                      <label className="block text-xs font-bold text-[#1C1917] mb-1">
                        Internal Admin / Sales Desk Follow-up Notes
                      </label>
                      <input
                        type="text"
                        placeholder="Add follow-up notes (e.g. Sent PDF catalog, quoted transport via V-Trans)..."
                        defaultValue={inq.internal_notes || ''}
                        onBlur={(e) => handleNotesChange(inq.id, e.target.value)}
                        className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Manual Inquiry Modal */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#E7E0D5] shadow-2xl max-w-xl w-full p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#E7E0D5] pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#722F37] tracking-wider">
                  Admin Direct Entry
                </span>
                <h3 className="font-serif-luxury text-xl font-bold text-[#1C1917]">
                  Record Manual Inquiry / Phone Order
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setManualModalOpen(false)}
                className="p-1 rounded-lg text-[#78716C] hover:bg-[#FAF7F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualInquiry} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1C1917] mb-1">
                    Buyer / Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ritu Singhania"
                    value={manualBuyer}
                    onChange={(e) => setManualBuyer(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1C1917] mb-1">
                    Boutique / Business Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ritu Silk Boutique"
                    value={manualBusiness}
                    onChange={(e) => setManualBusiness(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1C1917] mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98300 00000"
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1C1917] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="boutique@example.com"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1C1917] mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="City"
                    value={manualCity}
                    onChange={(e) => setManualCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1C1917] mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    placeholder="State"
                    value={manualState}
                    onChange={(e) => setManualState(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#FAF7F2] p-3 rounded-xl border border-[#E7E0D5]">
                <div>
                  <label className="block font-bold text-[#1C1917] mb-1">
                    Primary Design Code
                  </label>
                  <input
                    type="text"
                    value={manualProductCode}
                    onChange={(e) => setManualProductCode(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E7E0D5] bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1C1917] mb-1">
                    Design Title
                  </label>
                  <input
                    type="text"
                    value={manualProductTitle}
                    onChange={(e) => setManualProductTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E7E0D5] bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1C1917] mb-1">
                    Quantity Ratio (Pieces)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={manualQty}
                    onChange={(e) => setManualQty(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E7E0D5] bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1C1917] mb-1">
                    Quoted Rate / Pc (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={manualPrice}
                    onChange={(e) => setManualPrice(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E7E0D5] bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1C1917] mb-1">
                    Assign Staff Executive
                  </label>
                  <select
                    value={manualStaff}
                    onChange={(e) => setManualStaff(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white font-medium"
                  >
                    {STAFF_MEMBERS.filter(s => s !== 'Unassigned').map(sm => (
                      <option key={sm} value={sm}>{sm}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#1C1917] mb-1">
                    Inquiry Notes / Specific Requirements
                  </label>
                  <input
                    type="text"
                    value={manualMessage}
                    onChange={(e) => setManualMessage(e.target.value)}
                    placeholder="Notes or transport preference..."
                    className="w-full px-3 py-2 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7E0D5]">
                <button
                  type="button"
                  onClick={() => setManualModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#E7E0D5] text-[#78716C] font-semibold hover:bg-[#FAF7F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingManual}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#722F37] text-white font-bold hover:bg-[#5b242b] disabled:opacity-50 shadow-sm"
                >
                  {isSavingManual && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Wholesale Inquiry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
