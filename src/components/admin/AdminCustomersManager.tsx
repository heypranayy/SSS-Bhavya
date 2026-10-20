'use client';

import React, { useState } from 'react';
import { Customer } from '@/types';
import {
  Users,
  PlusCircle,
  Phone,
  Mail,
  MapPin,
  Tag,
  MessageCircle,
  Edit2,
  Check,
  X,
  Loader2,
  Trash2,
} from 'lucide-react';

interface AdminCustomersManagerProps {
  initialCustomers: Customer[];
}

export function AdminCustomersManager({ initialCustomers }: AdminCustomersManagerProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Kolkata');
  const [state, setState] = useState('West Bengal');
  const [segment, setSegment] = useState('Boutique');
  const [priceTier, setPriceTier] = useState('tier_1');
  const [discountPct, setDiscountPct] = useState(10);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingId(null);
    setBusinessName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setCity('Kolkata');
    setState('West Bengal');
    setSegment('Boutique');
    setPriceTier('tier_1');
    setDiscountPct(10);
    setErrorMsg(null);
    setModalOpen(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingId(c.id);
    setBusinessName(c.business_name);
    setContactPerson(c.contact_person || '');
    setPhone(c.phone || '');
    setEmail(c.email || '');
    setCity(c.city || 'Kolkata');
    setState(c.state || 'West Bengal');
    setSegment(c.segment || 'Boutique');
    setPriceTier(c.custom_price_tier || 'tier_1');
    setDiscountPct(c.discount_pct || 0);
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setErrorMsg('Business name is required');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const payload = {
        id: editingId || undefined,
        business_name: businessName.trim(),
        contact_person: contactPerson.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
        segment,
        custom_price_tier: priceTier,
        discount_pct: Number(discountPct) || 0,
      };

      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save customer');

      if (editingId) {
        setCustomers(prev => prev.map(c => c.id === editingId ? data.customer : c));
      } else {
        setCustomers(prev => [data.customer, ...prev]);
      }

      setModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving customer');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Business_Name', 'Contact_Person', 'Phone', 'Email', 'City', 'State', 'Segment', 'Price_Tier', 'Discount_Pct'];
    const rows = customers.map(c => [
      `"${c.business_name.replace(/"/g, '""')}"`,
      `"${(c.contact_person || '').replace(/"/g, '""')}"`,
      `"${c.phone || ''}"`,
      `"${c.email || ''}"`,
      `"${c.city || ''}"`,
      `"${c.state || ''}"`,
      c.segment || 'Boutique',
      c.custom_price_tier || 'standard',
      c.discount_pct || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bhavya_fashions_customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete customer "${name}"?`)) return;
    try {
      const res = await fetch('/api/customers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete customer');
      setCustomers(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error deleting customer');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#722F37] font-bold">
            B2B Client Directory
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1C1917]">
            Retailers, Boutiques &amp; Resellers ({customers.length})
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-[#E7E0D5] text-[#1C1917] hover:bg-[#FAF7F2] text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs"
          >
            <span>Export Customers CSV</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#722F37] text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-[#5C1D24] transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Customer</span>
          </button>
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((c) => (
          <div
            key={c.id}
            className="bg-white p-5 rounded-2xl border border-[#E7E0D5] shadow-xs space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-serif-luxury text-base font-bold text-[#1C1917]">
                    {c.business_name}
                  </h3>
                  {c.contact_person && (
                    <p className="text-xs text-[#78716C]">{c.contact_person}</p>
                  )}
                </div>

                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E7E0D5] text-[#722F37]">
                  {c.segment || 'Boutique'}
                </span>
              </div>

              <div className="p-3 bg-[#FAF7F2] rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#78716C]">Price Tier:</span>
                  <span className="font-bold text-[#722F37] uppercase">{c.custom_price_tier || 'Standard'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#78716C]">Discount:</span>
                  <span className="font-bold text-emerald-700">{c.discount_pct || 0}% OFF Wholesale</span>
                </div>
              </div>

              <div className="text-xs text-[#78716C] space-y-1 pt-1">
                {c.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span className="font-mono">{c.phone}</span>
                  </div>
                )}
                {c.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>{c.email}</span>
                  </div>
                )}
                {(c.city || c.state) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>{[c.city, c.state].filter(Boolean).join(', ')}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[#F3ECE2] flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openEditModal(c)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#E7E0D5] text-[#1C1917] hover:bg-[#EFE9E0] text-xs font-semibold cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#722F37]" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteCustomer(c.id, c.business_name)}
                  className="p-1.5 rounded-lg border border-[#E7E0D5] text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Delete Customer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {c.phone && (
                <a
                  href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${c.contact_person || c.business_name}, greetings from Bhavya Fashions Barabazar.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#20ba59]"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E7E0D5] space-y-4 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E0D5]">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#722F37]" />
                <h3 className="font-serif-luxury text-lg font-bold text-[#1C1917]">
                  {editingId ? 'Edit Customer' : 'Create New Customer'}
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

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                  Business / Boutique Name *
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Saffron Bridal Studio"
                  className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#722F37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Ananya Roy"
                    className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#722F37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98301 23456"
                    className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] font-mono focus:bg-white focus:outline-none focus:border-[#722F37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. contact@saffron.in"
                  className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#722F37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Kolkata"
                    className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#722F37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. West Bengal"
                    className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#722F37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Segment
                  </label>
                  <select
                    value={segment}
                    onChange={(e) => setSegment(e.target.value)}
                    className="w-full text-xs py-2 px-2.5 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2]"
                  >
                    <option value="Boutique">Boutique</option>
                    <option value="Wholesaler">Wholesaler</option>
                    <option value="Semi-wholesaler">Semi-wholesaler</option>
                    <option value="Online Reseller">Online Reseller</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Price Tier
                  </label>
                  <select
                    value={priceTier}
                    onChange={(e) => setPriceTier(e.target.value)}
                    className="w-full text-xs py-2 px-2.5 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2]"
                  >
                    <option value="tier_1">Tier 1 (VIP)</option>
                    <option value="tier_2">Tier 2</option>
                    <option value="tier_3">Tier 3</option>
                    <option value="standard">Standard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Discount %
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={discountPct}
                    onChange={(e) => setDiscountPct(Number(e.target.value))}
                    className="w-full text-xs py-2 px-2.5 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] font-mono"
                  />
                </div>
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
                  <span>{editingId ? 'Save Changes' : 'Create Customer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
