'use client';

import React, { useState } from 'react';
import { Catalog, CatalogProductView } from '@/types';
import { SelectedItemState } from './DesignSelector';
import { formatINR } from '@/lib/utils';
import { X, Send, CheckCircle2, MessageCircle, AlertCircle, Loader2 } from 'lucide-react';

interface InquiryModalProps {
  catalog: Catalog;
  products: CatalogProductView[];
  selections: Map<string, SelectedItemState>;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (refNo: string) => void;
}

export function InquiryModal({
  catalog,
  products,
  selections,
  isOpen,
  onClose,
  onSuccess,
}: InquiryModalProps) {
  const [buyerName, setBuyerName] = useState(catalog.customer?.contact_person || '');
  const [businessName, setBusinessName] = useState(catalog.customer?.business_name || '');
  const [phone, setPhone] = useState(catalog.customer?.phone || '');
  const [email, setEmail] = useState(catalog.customer?.email || '');
  const [city, setCity] = useState(catalog.customer?.city || '');
  const [state, setState] = useState(catalog.customer?.state || '');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedArray = Array.from(selections.values()).filter(s => s.totalQuantity > 0);
  const productMap = new Map(products.map(p => [p.id, p]));

  let totalQty = 0;
  let indicativeTotal = 0;
  selectedArray.forEach(s => {
    const p = productMap.get(s.productId);
    if (p) {
      totalQty += s.totalQuantity;
      indicativeTotal += p.quoted_price * s.totalQuantity;
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!buyerName.trim() || !businessName.trim() || !phone.trim()) {
      setErrorMsg('Please fill in your name, business name, and WhatsApp phone number.');
      return;
    }

    if (selectedArray.length === 0) {
      setErrorMsg('Please select at least one design to inquire.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        catalog_id: catalog.id,
        customer_id: catalog.customer_id,
        buyer_name: buyerName.trim(),
        business_name: businessName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        message: message.trim() || undefined,
        items: selectedArray.map(sel => ({
          product_id: sel.productId,
          size_breakdown: sel.sizeBreakdown,
          notes: sel.notes,
        })),
      };

      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit inquiry.');
      }

      setSubmittedRef(data.reference_no);
      onSuccess(data.reference_no);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919830122334';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#E7E0D5] my-8">
        {/* Header */}
        <div className="bg-[#FAF7F2] border-b border-[#E7E0D5] px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#722F37] font-bold block">
              Wholesale Inquiry Form
            </span>
            <h3 className="font-serif-luxury text-lg font-bold text-[#1C1917]">
              {submittedRef ? 'Inquiry Submitted Successfully' : 'Submit Wholesale Requirement'}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#78716C] hover:bg-[#EFE9E0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submittedRef ? (
            /* Success View */
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="font-serif-luxury text-xl font-bold text-[#1C1917]">
                  Thank You, {buyerName}!
                </h4>
                <p className="text-xs text-[#78716C] mt-1">
                  Your wholesale inquiry has been registered with our sales dispatch desk.
                </p>
              </div>

              <div className="bg-[#FAF7F2] border border-[#E7E0D5] p-4 rounded-xl text-left space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#78716C]">Inquiry Reference:</span>
                  <span className="font-mono font-bold text-[#722F37] text-sm">{submittedRef}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#78716C]">Designs Selected:</span>
                  <span className="font-semibold text-[#1C1917]">{selectedArray.length} designs</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#78716C]">Total Quantity:</span>
                  <span className="font-semibold text-[#1C1917]">{totalQty} pcs</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#78716C]">Indicative Quote:</span>
                  <span className="font-bold text-[#722F37]">{formatINR(indicativeTotal)}</span>
                </div>
              </div>

              <div className="pt-2 space-y-2.5">
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                    `Hello Bhavya Fashions, I submitted wholesale inquiry ${submittedRef} for ${businessName} (${totalQty} pcs). Please confirm stock availability and dispatch schedule.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#25D366] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#20ba59] transition-all shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Connect on WhatsApp for Quick Dispatch</span>
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 text-xs text-[#78716C] hover:text-[#1C1917] font-semibold"
                >
                  Close & Continue Browsing
                </button>
              </div>
            </div>
          ) : (
            /* Form View */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Requirement Summary Pill */}
              <div className="bg-[#FAF7F2] border border-[#E7E0D5] p-3 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#78716C] block">Selected:</span>
                  <span className="font-bold text-[#1C1917]">{selectedArray.length} Designs ({totalQty} pcs)</span>
                </div>
                <div className="text-right">
                  <span className="text-[#78716C] block">Est. Subtotal:</span>
                  <span className="font-extrabold text-[#722F37] text-sm">{formatINR(indicativeTotal)}</span>
                </div>
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="e.g. Rajesh Gupta"
                    className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Boutique / Shop Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Radha Krishna Ethnic"
                    className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    WhatsApp Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98301 22334"
                    className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="orders@yourboutique.com"
                    className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    City / Town
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Kolkata, Surat, Mumbai"
                    className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
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
                    placeholder="e.g. West Bengal, Gujarat"
                    className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                  Special Dispatch or Transport Notes
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Send transport booking via V-Trans, need poly-pack with size labels..."
                  className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-lg bg-[#722F37] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#5C1D24] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Requirement to Dispatch...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Requirement to Bhavya Fashions</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-center text-[#78716C] mt-2">
                  No payment is processed online. Our wholesale dispatch manager will contact you directly to confirm transport and invoice details.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
