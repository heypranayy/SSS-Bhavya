'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowUpRight,
  ArrowUp,
  Sparkles,
  PhoneCall,
} from 'lucide-react';

export function Footer() {
  const currentYear = 2026;
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919830729210';

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#120B0D] text-[#E7E0D5] pt-16 pb-24 md:pb-14 border-t border-[#341B22] relative overflow-hidden">
      {/* Ambient background gold/burgundy glow */}
      <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-[#722F37]/15 blur-[120px] pointer-events-none" />

      {/* Brand Marquee Ticker */}
      <div className="border-b border-white/10 pb-8 mb-12 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center text-xs tracking-widest uppercase font-mono text-[#C5A059]">
          <span className="mx-8">★ DIRECT MANUFACTURER LOOMS (SURAT)</span>
          <span className="mx-8">★ BARABAZAR (KOLKATA) DISPATCH HUB</span>
          <span className="mx-8">★ STRICTLY B2B WHOLESALE • MOQ 6 PCS</span>
          <span className="mx-8">★ SERVING 5,000+ BOUTIQUE PARTNERS</span>
          <span className="mx-8">★ FULL GST INVOICING & FAST TRANSPORT</span>
          {/* Duplicate for infinite loop */}
          <span className="mx-8">★ DIRECT MANUFACTURER LOOMS (SURAT)</span>
          <span className="mx-8">★ BARABAZAR (KOLKATA) DISPATCH HUB</span>
          <span className="mx-8">★ STRICTLY B2B WHOLESALE • MOQ 6 PCS</span>
          <span className="mx-8">★ SERVING 5,000+ BOUTIQUE PARTNERS</span>
          <span className="mx-8">★ FULL GST INVOICING & FAST TRANSPORT</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info & Centered Logo Showcase */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="inline-block group">
              <img
                src="/images/bhavya-logo.png"
                alt="Bhavya Fashions"
                className="h-11 sm:h-13 w-auto object-contain drop-shadow-md group-hover:scale-102 transition-transform"
              />
            </Link>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-sm font-light">
              Premier manufacturer and wholesale distributor of designer single kurtis, 2-piece kurti sets, and 3-piece muslin ensembles. Supplying quality-tested apparel directly to boutique owners, multi-brand outlets, and online resellers nationwide.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-center gap-2 text-xs text-[#C5A059] bg-white/5 border border-[#C5A059]/30 px-3 py-1.5 rounded-lg">
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#C5A059]" />
                <span className="font-medium">Strictly B2B Trade Wholesale</span>
              </div>

              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#25D366] text-white hover:bg-[#20ba59] transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>+91 98307 29210</span>
              </a>
            </div>
          </div>

          {/* Wholesale Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#C5A059] font-bold border-b border-white/10 pb-2">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-400">
              <li>
                <Link href="/products?category=Three-Piece%20Kurtis%20(3P)" className="hover:text-white transition-colors">
                  Three-Piece Muslin Sets
                </Link>
              </li>
              <li>
                <Link href="/products?category=Two-Piece%20Kurtis%20(2P)" className="hover:text-white transition-colors">
                  Two-Piece Kurti Pant Sets
                </Link>
              </li>
              <li>
                <Link href="/products?category=Co-ord%20Sets" className="hover:text-white transition-colors">
                  Contemporary Co-ords
                </Link>
              </li>
              <li>
                <Link href="/products?category=Anarkalis%20%26%20Gowns" className="hover:text-white transition-colors">
                  Flared Anarkalis & Gowns
                </Link>
              </li>
              <li>
                <Link href="/products?category=Single%20Kurtis" className="hover:text-white transition-colors">
                  Single Everyday Kurtis
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Wholesale Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#C5A059] font-bold border-b border-white/10 pb-2">
              Wholesale Desk
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-400">
              <li>
                <Link href="/collections" className="hover:text-white transition-colors">
                  Wholesale Lookbooks
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Surat Mills & Heritage
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  B2B Trade Insights
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Showroom & Transport Hub
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#C5A059] transition-colors inline-flex items-center gap-1 text-[#C5A059]">
                  <span>Staff & Sales Portal</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Hubs & Physical Showroom */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#C5A059] font-bold border-b border-white/10 pb-2">
              Barabazar Showroom
            </h4>
            <div className="space-y-2.5 text-xs text-zinc-400">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                <span>5, Shiv Thakur Lane, Kalakar St, near R.K The Bed Cover Studio, Barabazar, Kolkata — 700007</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>+91 98307 29210 / +91 98301 22334</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>wholesale@bhavyafashions.com</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>Mon – Sat: 10:30 AM – 7:30 PM IST</span>
              </p>
            </div>
          </div>
        </div>

        {/* Legal, Gexart Technologies Branding & Back-To-Top Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>© {currentYear} Bhavya Fashions. All Rights Reserved. Strictly B2B Wholesale Trade Platform.</p>

          {/* Gexart Technologies Signature Badge */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse" />
            <span className="text-zinc-400">Built by</span>
            <a
              href="https://www.gexart.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C5A059] hover:text-white font-semibold transition-colors inline-flex items-center gap-1 group"
            >
              <span>Gexart Technologies</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#C5A059] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5 text-[#C5A059]" />
          </button>
        </div>
      </div>
    </footer>
  );
}
