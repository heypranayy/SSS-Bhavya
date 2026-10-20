'use client';

import React from 'react';
import { PhoneCall, Phone, BookOpen, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function MobileQuickBar() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919830729210';

  return (
    <aside aria-label="Mobile quick actions" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1A0B0E]/95 backdrop-blur-md border-t border-[#C5A059]/40 py-2.5 px-4 shadow-2xl pb-safe">
      <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
        {/* Call Showroom */}
        <a
          href="tel:+919830729210"
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Call Showroom"
        >
          <Phone className="w-4 h-4 text-[#C5A059]" />
          <span className="text-[10px] font-semibold mt-0.5 tracking-tight">Call Desk</span>
        </a>

        {/* Primary WhatsApp Action with Pulsing Glow */}
        <a
          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello Bhavya Fashions, I am an ethnic wear retailer. Please share current wholesale catalogs.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-[2] relative flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#25D366] text-white shadow-lg hover:bg-[#20ba59] transition-all font-bold text-xs uppercase tracking-wider"
          aria-label="WhatsApp Wholesale"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
          </span>
          <PhoneCall className="w-4 h-4 shrink-0" />
          <span className="truncate">WhatsApp B2B</span>
        </a>

        {/* View Catalog */}
        <Link
          href="/collections"
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="View Collections"
        >
          <BookOpen className="w-4 h-4 text-[#C5A059]" />
          <span className="text-[10px] font-semibold mt-0.5 tracking-tight">Catalogs</span>
        </Link>
      </div>
    </aside>
  );
}
