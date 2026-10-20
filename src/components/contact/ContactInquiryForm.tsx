'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2, PhoneCall } from 'lucide-react';

export function ContactInquiryForm() {
  const [buyerName, setBuyerName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!buyerName.trim() || !businessName.trim() || !phone.trim()) {
      setErrorMsg('Please enter your contact name, boutique/shop name, and WhatsApp phone number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiry_type: 'website',
          source_page: '/contact',
          buyer_name: buyerName.trim(),
          business_name: businessName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          city: city.trim() || undefined,
          state: state.trim() || undefined,
          message: message.trim() || undefined,
          items: [],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit wholesale inquiry.');
      }

      setSubmittedRef(data.reference_no);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919830729210';

  if (submittedRef) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-[#E7E0D5] shadow-xs text-center space-y-4">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="font-serif-luxury text-2xl font-bold text-[#1C1917]">
          Thank You, {buyerName}!
        </h3>
        <p className="text-xs text-[#78716C] max-w-md mx-auto">
          Your wholesale inquiry has been registered with reference{' '}
          <strong className="font-mono text-[#722F37] text-sm">{submittedRef}</strong>. Our B2B sales team will reach out with lookbooks and wholesale pricing.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
              `Hello Bhavya Fashions, I submitted website inquiry ${submittedRef} for ${businessName}. Please share your current wholesale kurti catalogs.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#20ba59]"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Connect on WhatsApp for Quick Response</span>
          </a>

          <button
            type="button"
            onClick={() => {
              setSubmittedRef(null);
              setBuyerName('');
              setBusinessName('');
              setPhone('');
              setEmail('');
              setMessage('');
            }}
            className="text-xs text-[#78716C] hover:underline"
          >
            Submit Another Requirement
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E0D5] shadow-xs space-y-4">
      <div className="border-b border-[#F3ECE2] pb-4">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#722F37] font-bold block">
          Direct Trade Form
        </span>
        <h3 className="font-serif-luxury text-xl font-bold text-[#1C1917]">
          Submit Wholesale Requirement
        </h3>
        <p className="text-xs text-[#78716C] mt-0.5">
          Are you a retailer, reseller, or boutique owner? Send us your requirements for bulk lot supply.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1C1917] mb-1">
              Contact Person Name *
            </label>
            <input
              type="text"
              required
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="e.g. Ramesh Chandra"
              className="w-full text-xs py-2.5 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1917] mb-1">
              Boutique / Firm Name *
            </label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Radha Sarees & Ethnic"
              className="w-full text-xs py-2.5 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1C1917] mb-1">
              WhatsApp Contact Number *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98307 29210"
              className="w-full text-xs py-2.5 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
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
              className="w-full text-xs py-2.5 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1C1917] mb-1">
              City / Market Area
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Kolkata, Patna, Lucknow, Mumbai"
              className="w-full text-xs py-2.5 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
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
              placeholder="e.g. West Bengal, Bihar, UP"
              className="w-full text-xs py-2.5 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1C1917] mb-1">
            Requirement Details / Questions
          </label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what types of kurtis you need (e.g. 3-Piece Kesaria Silk sets, 2-Piece sets, quantity needed, preferred transport company)..."
            className="w-full text-xs py-2.5 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#722F37]"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 rounded-xl bg-[#722F37] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#5C1D24] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Submitting Wholesale Form...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit Wholesale Inquiry to Sales Desk</span>
            </>
          )}
        </button>

        <p className="text-[11px] text-center text-[#78716C]">
          * Strictly wholesale supply. No retail single pieces. Transport dispatches handled across all India states.
        </p>
      </form>
    </div>
  );
}
