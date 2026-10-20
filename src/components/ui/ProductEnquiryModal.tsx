'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import { getProductFallbackImage } from '@/lib/utils';
import { X, Send, CheckCircle2, AlertCircle, Loader2, Sparkles, PhoneCall } from 'lucide-react';

interface ProductEnquiryModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  catalogId?: string;
  sourcePage?: string;
  defaultSize?: string;
}

export function ProductEnquiryModal({
  product,
  isOpen,
  onClose,
  catalogId,
  sourcePage = '/wholesale',
  defaultSize,
}: ProductEnquiryModalProps) {
  if (!isOpen || !product) return null;

  const [buyerName, setBuyerName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(defaultSize || product.variants?.[0]?.size || 'Standard Set');
  const [quantity, setQuantity] = useState(product.moq || 6);
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successRef, setSuccessRef] = useState<string | null>(null);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919830729210';
  const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!buyerName.trim() || buyerName.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }

    const cleanPhone = phone.trim().replace(/[^0-9+]/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      setError('Please provide a valid WhatsApp / contact number.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiry_type: 'price_request',
          source_page: sourcePage,
          catalog_id: catalogId,
          product_id: product.id,
          product_code: product.code,
          product_title: product.title,
          selected_variant: selectedVariant,
          requested_quantity: Number(quantity) || 6,
          buyer_name: buyerName.trim(),
          business_name: businessName.trim() || 'Retail Buyer',
          phone: cleanPhone,
          email: email.trim() || undefined,
          message: message.trim() || `Wholesale price quotation requested for design ${product.code} - ${product.title}`,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to submit price request. Please try again or WhatsApp us.');
        setSubmitting(false);
        return;
      }

      setSuccessRef(data.reference_no);
      setSubmitting(false);
    } catch {
      setError('Network connection error. Please try again or WhatsApp our desk directly.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#E7E0D5] z-10 my-auto animate-in fade-in zoom-in-95 duration-200 text-[#1C1917]">
        {/* Header */}
        <div className="bg-[#FAF7F2] p-6 border-b border-[#E7E0D5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {(() => {
              const fallbackSrc = getProductFallbackImage(product.style_type);
              const imgSrc =
                (primaryImage as any)?.local_url ||
                primaryImage?.image_url ||
                fallbackSrc;
              return (
                <div className="w-12 h-16 rounded-lg overflow-hidden bg-zinc-100 border border-[#E7E0D5] shrink-0">
                  <img
                    src={imgSrc}
                    alt={product.title}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== fallbackSrc) {
                        target.src = fallbackSrc;
                      }
                    }}
                  />
                </div>
              );
            })()}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#722F37] font-bold block">
                Wholesale Price on Request
              </span>
              <h3 className="font-serif-luxury text-base sm:text-lg font-bold text-[#1C1917] line-clamp-1">
                {product.title}
              </h3>
              <span className="text-xs text-zinc-500 font-mono">
                Design: <span className="font-bold text-[#1C1917]">{product.code}</span>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-900 rounded-full hover:bg-zinc-200/50 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {successRef ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h4 className="font-serif-luxury text-2xl font-bold text-[#1C1917]">
                Price Request Received!
              </h4>

              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E7E0D5] max-w-sm mx-auto">
                <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 block">
                  Enquiry Reference Number
                </span>
                <span className="font-mono text-base font-bold text-[#722F37]">
                  {successRef}
                </span>
              </div>

              <p className="text-xs text-zinc-600 max-w-sm mx-auto leading-relaxed">
                Our wholesale desk has received your quotation request for design{' '}
                <strong className="text-zinc-900">{product.code}</strong>. An account executive will message your WhatsApp with tiered wholesale pricing shortly.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello Bhavya Fashions, I submitted price request ${successRef} for design ${product.code} - ${product.title}. Please share wholesale quotation.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#20ba59]"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Follow Up on WhatsApp</span>
                </a>

                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-zinc-100 text-zinc-800 text-xs font-semibold hover:bg-zinc-200"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#722F37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9830729210"
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#722F37] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    Shop / Boutique Name <span className="text-zinc-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Royal Heritage Studio"
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#722F37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    Email Address <span className="text-zinc-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. wholesale@boutique.in"
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#722F37]"
                  />
                </div>
              </div>

              {/* Variant / Size & Quantity */}
              <div className="grid grid-cols-2 gap-3 bg-[#FAF7F2] p-3 rounded-2xl border border-[#E7E0D5]">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                    Selected Size / Ratio
                  </label>
                  {product.variants?.length > 0 ? (
                    <select
                      value={selectedVariant}
                      onChange={(e) => setSelectedVariant(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-[#E7E0D5] bg-white font-medium"
                    >
                      <option value="Standard Ratio Set (M-3XL)">Standard Ratio Set (M-3XL)</option>
                      {product.variants.map((v) => (
                        <option key={v.size} value={v.size}>Size {v.size}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      readOnly
                      value="Standard Set"
                      className="w-full text-xs p-2 rounded-lg border border-[#E7E0D5] bg-white text-zinc-600 font-mono"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                    Quantity (Min {product.moq} pcs)
                  </label>
                  <input
                    type="number"
                    min={product.moq || 6}
                    step={product.moq || 6}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(product.moq || 6, Number(e.target.value)))}
                    className="w-full text-xs p-2 rounded-lg border border-[#E7E0D5] bg-white font-mono font-bold text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Additional Note <span className="text-zinc-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Need Barabazar transport delivery timeline or fabric swatch details."
                  className="w-full text-xs p-2.5 rounded-xl border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#722F37]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#722F37] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#58111A] transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Price Request...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Price Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
