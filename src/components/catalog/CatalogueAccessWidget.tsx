'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, ArrowRight, Loader2, AlertCircle, Sparkles, PhoneCall, ShieldCheck } from 'lucide-react';

interface CatalogueAccessWidgetProps {
  className?: string;
  variant?: 'card' | 'inline';
}

export function CatalogueAccessWidget({ className = '', variant = 'card' }: CatalogueAccessWidgetProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919830729210';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim();
    if (!cleanCode) {
      setError('Please enter your wholesale catalogue code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/catalog/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cleanCode }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid catalogue code.');
        setLoading(false);
        return;
      }

      // Smoothly navigate to verified catalogue
      router.push(data.redirectUrl);
    } catch {
      setError('Connection error verifying catalogue code. Please check your internet or try again.');
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative rounded-3xl overflow-hidden ${
        variant === 'card'
          ? 'bg-[#1C1215] text-[#FAF7F2] p-6 sm:p-10 border border-[#C5A059]/40 shadow-2xl'
          : 'bg-transparent text-[#1C1917]'
      } ${className}`}
    >
      {/* Background ambient glow */}
      {variant === 'card' && (
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#722F37]/30 rounded-full blur-3xl pointer-events-none" />
      )}

      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/30 text-[#C5A059] text-[10px] sm:text-xs font-semibold uppercase tracking-widest">
          <KeyRound className="w-3.5 h-3.5" />
          <span>Exclusive Retailer Access</span>
        </div>

        <h3 className="font-serif-luxury text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
          Access Your Wholesale Catalogue
        </h3>

        <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed max-w-lg mx-auto">
          Have a private catalogue code shared by your Bhavya Fashions account manager? Enter it below to explore your curated wholesale designs and locked B2B rates.
        </p>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mt-6 max-w-md mx-auto space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 focus-within:border-[#C5A059] transition-all">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. BF-VIP-2026 or catalogue token"
              className="flex-1 px-4 py-3 bg-transparent text-white text-xs sm:text-sm placeholder:text-zinc-400 focus:outline-none font-mono"
              disabled={loading}
              autoComplete="off"
            />

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#C5A059] text-[#1C1215] text-xs font-bold uppercase tracking-wider hover:bg-[#d8b46e] transition-all shadow-md shrink-0 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>View Catalogue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-start gap-2.5 text-left animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span>{error}</span>
                <p className="text-[11px] text-zinc-400">
                  Need a catalogue code? Contact our wholesale desk on{' '}
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello Bhavya Fashions, please generate a private wholesale catalogue code for my boutique.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#25D366] underline font-semibold"
                  >
                    WhatsApp (+91 98307 29210)
                  </a>
                </p>
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-zinc-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Encrypted & Trade Verified</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Instant Catalog Unlock</span>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
