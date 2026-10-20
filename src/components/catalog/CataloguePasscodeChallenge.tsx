'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Lock, ArrowRight, ShieldCheck, PhoneCall, AlertCircle } from 'lucide-react';

interface CataloguePasscodeChallengeProps {
  catalogTitle: string;
  catalogSubtitle?: string;
  token: string;
  expectedCode: string;
}

export function CataloguePasscodeChallenge({
  catalogTitle,
  catalogSubtitle,
  token,
  expectedCode,
}: CataloguePasscodeChallengeProps) {
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputCode.trim();
    if (!clean) {
      setError('Please enter the access code provided by Bhavya Fashions.');
      return;
    }

    setLoading(true);
    if (clean.toLowerCase() === expectedCode.trim().toLowerCase()) {
      setError('');
      router.push(`/catalog/${token}?code=${encodeURIComponent(clean)}`);
    } else {
      setLoading(false);
      setError('Invalid Access Code. Please check the code or contact sales on WhatsApp.');
    }
  };

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919830729210';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#E7E0D5] p-8 sm:p-10 text-center shadow-xl space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#722F37]/10 text-[#722F37] flex items-center justify-center mx-auto border border-[#722F37]/20">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/30 text-[#8C6D23] text-[10px] font-bold uppercase tracking-widest">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Private Wholesale Lookbook</span>
          </div>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1C1917]">
            {catalogTitle}
          </h1>
          {catalogSubtitle && (
            <p className="text-xs text-zinc-500 font-light">
              {catalogSubtitle}
            </p>
          )}
          <p className="text-xs text-zinc-600 leading-relaxed pt-2">
            This curated wholesale catalogue is password-protected. Please enter the secret Access Code provided by Bhavya Fashions to unlock locked B2B wholesale designs.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUnlock} className="space-y-3">
          <input
            type="text"
            required
            autoFocus
            value={inputCode}
            onChange={(e) => {
              setInputCode(e.target.value);
              if (error) setError('');
            }}
            placeholder="Enter Access Code (e.g. BF-VIP-...)"
            className="w-full text-center font-mono text-sm uppercase font-bold py-3 px-4 rounded-xl border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#722F37] tracking-wider"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#722F37] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#58111A] transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <span>Unlock Wholesale Lookbook</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#E7E0D5] space-y-2">
          <span className="text-[11px] text-zinc-400 block">
            Don't have an access code or lost your key?
          </span>
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
              `Hello Bhavya Fashions, I am requesting the Access Code for wholesale catalog "${catalogTitle}".`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Request Access Code on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
