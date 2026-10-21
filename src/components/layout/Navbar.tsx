'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  PhoneCall,
  Sparkles,
  ShieldCheck,
  Share2,
  ChevronDown,
  Layers,
  MapPin,
  Check,
  Copy,
  ExternalLink,
  Phone,
  MessageCircle,
} from 'lucide-react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shareDrawerOpen, setShareDrawerOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919830729210';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const categories = [
    { name: 'Three-Piece Kurtis (3P)', slug: '3-piece-kurtis', desc: 'Muslin, Silk & Chanderi sets with dupatta' },
    { name: 'Two-Piece Sets (2P)', slug: '2-piece-kurtis', desc: 'Matching Kurti & Pant / Palazzo sets' },
    { name: 'Contemporary Co-ords', slug: 'coord-sets', desc: 'Western-ethnic fusion printed sets' },
    { name: 'Flared Anarkalis & Gowns', slug: 'anarkalis-gowns', desc: 'Kalidar partywear & wedding silhouettes' },
    { name: 'Single Kurtis', slug: 'single-kurtis', desc: 'Daily wear & boutique straight kurtis' },
  ];

  return (
    <>
      <header className="sticky top-0 left-0 right-0 z-50 w-full transition-all duration-300">
        {/* Top Luxury B2B Marquee Ticker */}
        <div className="bg-[#120B0D] text-[#E7E0D5] text-xs tracking-widest font-medium overflow-hidden border-b border-[#2C181D] h-8 flex items-center">
          <div className="animate-marquee whitespace-nowrap flex items-center">
            <span className="mx-8 flex items-center gap-2 text-[#C5A059]">
              <Sparkles className="w-3 h-3 text-[#C5A059]" />
              BHAVYA FASHIONS — PREMIER ETHNIC WEAR WHOLESALE
            </span>
            <span className="mx-8 text-white/70">★ DIRECT MANUFACTURER PRICING (STARTING ₹380/PC)</span>
            <span className="mx-8 text-white/70">★ STRICTLY B2B • MOQ 6 PCS PER DESIGN</span>
            <span className="mx-8 text-white/70">★ BARABAZAR (KOLKATA) & SURAT DISPATCH HUBS</span>
            <span className="mx-8 text-[#C5A059]">★ TRUSTED BY 5,000+ BOUTIQUES & RETAILERS ACROSS INDIA</span>
            <span className="mx-8 text-white/70">★ EXPRESS DISPATCH IN 24-48 HOURS</span>
            {/* Duplicated for seamless infinite loop */}
            <span className="mx-8 flex items-center gap-2 text-[#C5A059]">
              <Sparkles className="w-3 h-3 text-[#C5A059]" />
              BHAVYA FASHIONS — PREMIER ETHNIC WEAR WHOLESALE
            </span>
            <span className="mx-8 text-white/70">★ DIRECT MANUFACTURER PRICING (STARTING ₹380/PC)</span>
            <span className="mx-8 text-white/70">★ STRICTLY B2B • MOQ 6 PCS PER DESIGN</span>
            <span className="mx-8 text-white/70">★ BARABAZAR (KOLKATA) & SURAT DISPATCH HUBS</span>
            <span className="mx-8 text-[#C5A059]">★ TRUSTED BY 5,000+ BOUTIQUES & RETAILERS ACROSS INDIA</span>
            <span className="mx-8 text-white/70">★ EXPRESS DISPATCH IN 24-48 HOURS</span>
          </div>
        </div>

        {/* Main Brand Navigation Bar */}
        <nav
          className={`w-full bg-[#4A0E17] text-white transition-all duration-300 border-b border-[#C5A059]/30 ${
            isScrolled ? 'h-18 shadow-2xl bg-[#4A0E17]/98 backdrop-blur-md' : 'h-20'
          } px-4 sm:px-6 lg:px-10 flex items-center justify-between`}
        >
          {/* Left Navigation (Desktop) */}
          <div className="hidden lg:flex items-center gap-7 w-5/12">
            {/* Products with Mega Dropdown */}
            <div
              className="relative py-2 group"
              onMouseEnter={() => setProductsDropdownOpen(true)}
              onMouseLeave={() => setProductsDropdownOpen(false)}
            >
              <Link
                href="/wholesale"
                className="flex items-center gap-1.5 text-sm font-medium tracking-wide text-[#FAF7F2] hover:text-[#C5A059] transition-colors py-1 cursor-pointer"
              >
                <span>Wholesale Catalog</span>
                <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180 text-[#C5A059]" />
              </Link>

              {/* Dropdown Menu */}
              <div
                className={`absolute left-0 mt-2 w-72 bg-[#1C1917] border border-[#C5A059]/40 rounded-xl shadow-2xl py-3 transition-all duration-200 transform z-50 ${
                  productsDropdownOpen
                    ? 'opacity-100 visible translate-y-0'
                    : 'opacity-0 invisible translate-y-2 pointer-events-none'
                }`}
              >
                <div className="px-4 py-1.5 border-b border-white/10 mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A059]">
                    Select Category
                  </span>
                </div>
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/wholesale?category=${encodeURIComponent(cat.name)}#explorer`}
                    onClick={() => setProductsDropdownOpen(false)}
                    className="block px-4 py-2 hover:bg-white/10 transition-colors group/item"
                  >
                    <div className="text-xs font-semibold text-white group-hover/item:text-[#C5A059] flex items-center justify-between">
                      <span>{cat.name}</span>
                      <span className="text-[10px] text-white/40 group-hover/item:text-[#C5A059]">→</span>
                    </div>
                    <span className="text-[10px] text-white/60 block mt-0.5">{cat.desc}</span>
                  </Link>
                ))}
                <div className="mt-2 pt-2 border-t border-white/10 px-4">
                  <Link
                    href="/wholesale"
                    onClick={() => setProductsDropdownOpen(false)}
                    className="text-xs font-semibold text-[#C5A059] hover:underline flex items-center gap-1"
                  >
                    <span>Open Complete Wholesale Explorer</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>

            <Link
              href="/collections"
              className="text-sm font-medium tracking-wide text-[#FAF7F2] hover:text-[#C5A059] transition-colors relative py-1"
            >
              Collections
            </Link>

            <Link
              href="/about"
              className="text-sm font-medium tracking-wide text-[#FAF7F2] hover:text-[#C5A059] transition-colors relative py-1"
            >
              Our Heritage
            </Link>

            <Link
              href="/blog"
              className="text-sm font-medium tracking-wide text-[#FAF7F2] hover:text-[#C5A059] transition-colors relative py-1"
            >
              B2B Insights
            </Link>
          </div>

          {/* Mobile Hamburger Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 -ml-2 text-white hover:text-[#C5A059] transition-colors"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Center Brand Identity (Logo-Oriented) */}
          <div className="flex-1 flex justify-center lg:w-2/12">
            <Link href="/" className="flex items-center justify-center gap-2.5 group py-1">
              {/* Primary White & Gold Brand Logo */}
              <div className="relative flex items-center">
                <img
                  src="/images/bhavya-logo.png"
                  alt="Bhavya Fashions Logo"
                  className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Link>
          </div>

          {/* Right Navigation & CTAs (Desktop) */}
          <div className="hidden lg:flex items-center justify-end gap-5 w-5/12">
            <Link
              href="/contact"
              className="text-sm font-medium tracking-wide text-[#FAF7F2] hover:text-[#C5A059] transition-colors py-1"
            >
              Contact Us & Showroom
            </Link>

            {/* Quick Share / Catalog Button */}
            <button
              onClick={() => setShareDrawerOpen(true)}
              className="p-2 text-white/80 hover:text-[#C5A059] hover:bg-white/10 rounded-full transition-colors"
              title="Share Catalog & Inquiry"
              aria-label="Share Catalog"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* WhatsApp Wholesale Fast CTA */}
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello Bhavya Fashions, I am a boutique owner / retailer interested in your wholesale ethnic wear collections.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-[#20ba59] hover:scale-105 transition-all duration-200"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>WhatsApp Wholesale</span>
            </a>

            <Link
              href="/admin"
              className="text-[11px] font-semibold text-white/70 hover:text-[#C5A059] uppercase tracking-wider py-1 border-l border-white/20 pl-4"
            >
              Staff Portal
            </Link>
          </div>

          {/* Mobile Right Action Buttons */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setShareDrawerOpen(true)}
              className="p-2 text-white hover:text-[#C5A059] transition-colors"
              aria-label="Share Catalog"
            >
              <Share2 className="w-5 h-5" />
            </button>

            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello Bhavya Fashions, I want wholesale kurti catalogs.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-[#25D366] text-white hover:bg-[#20ba59] shadow-md transition-all"
              aria-label="WhatsApp Wholesale"
            >
              <PhoneCall className="w-4 h-4" />
            </a>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Menu (Slide from Left) */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Drawer Panel */}
        <div
          className={`absolute inset-y-0 left-0 w-4/5 max-w-sm bg-[#1A0D10] text-[#FAF7F2] p-6 shadow-2xl border-r border-[#C5A059]/30 transition-transform duration-300 ease-out flex flex-col justify-between overflow-y-auto ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div>
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-5 border-b border-white/10">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                <img
                  src="/images/bhavya-logo.png"
                  alt="Bhavya Fashions"
                  className="h-9 w-auto object-contain"
                />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* B2B Status Tag */}
            <div className="mt-4 px-3 py-2 rounded-lg bg-[#C5A059]/15 border border-[#C5A059]/30 text-[#C5A059] text-[11px] font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Direct Manufacturer • Strictly B2B Wholesale</span>
            </div>

            {/* Navigation Links */}
            <div className="mt-6 space-y-5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A059] font-bold block mb-2">
                  Wholesale Categories
                </span>
                <div className="space-y-1.5 pl-2 border-l border-[#C5A059]/30">
                  <Link
                    href="/wholesale"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1.5 text-sm font-bold text-[#C5A059] transition-colors"
                  >
                    ★ All Wholesale Designs (Explorer)
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/wholesale?category=${encodeURIComponent(cat.name)}#explorer`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1.5 text-sm font-medium text-white/90 hover:text-[#C5A059] transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/10">
                <Link
                  href="/collections"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-base font-medium text-white hover:text-[#C5A059] transition-colors"
                >
                  Curated Lookbooks
                </Link>
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-base font-medium text-white hover:text-[#C5A059] transition-colors"
                >
                  Our Heritage & Surat Mill
                </Link>
                <Link
                  href="/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-base font-medium text-white hover:text-[#C5A059] transition-colors"
                >
                  B2B Trade Insights
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-base font-medium text-white hover:text-[#C5A059] transition-colors"
                >
                  Contact Us &amp; Showroom
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-xs uppercase tracking-wider text-[#C5A059] hover:underline pt-2"
                >
                  Admin / Staff Login →
                </Link>
              </div>
            </div>
          </div>

          {/* Drawer Footer CTA */}
          <div className="pt-6 border-t border-white/10 space-y-3">
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello Bhavya Fashions, I am an ethnic wear retailer requesting wholesale catalogs.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-[#25D366] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Chat on WhatsApp (+91 98307 29210)</span>
            </a>
            <p className="text-[10px] text-white/50 text-center">
              5, Shiv Thakur Lane, Barabazar, Kolkata — 700007
            </p>
          </div>
        </div>
      </div>

      {/* Share & Quick Catalog Request Drawer (Slide from Right, like mbaazar) */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          shareDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setShareDrawerOpen(false)}
        />

        {/* Slide-over Container */}
        <div
          className={`absolute inset-y-0 right-0 w-4/5 max-w-sm bg-white text-[#1C1917] p-6 shadow-2xl border-l border-[#E7E0D5] transition-transform duration-300 ease-out flex flex-col justify-between ${
            shareDrawerOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-5 border-b border-[#E7E0D5]">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#722F37] font-semibold">
                  Share & Connect
                </span>
                <h3 className="font-serif-luxury text-lg font-bold text-[#1C1917]">
                  Bhavya Fashions B2B
                </h3>
              </div>
              <button
                onClick={() => setShareDrawerOpen(false)}
                className="p-1.5 text-zinc-500 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition-colors"
                aria-label="Close share panel"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-xs text-[#78716C] mt-4 leading-relaxed">
              Share Bhavya Fashions' wholesale ethnic wear catalog with your business partners, retail buyers, or purchase managers.
            </p>

            {/* Quick Share Buttons */}
            <div className="mt-6 space-y-3">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent('Check out Bhavya Fashions B2B Wholesale Kurtis & Ethnic Wear Catalog: https://bhavyafashions.com')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-3.5 border border-[#E7E0D5] rounded-xl hover:border-[#25D366] hover:bg-emerald-50/50 transition-all text-sm font-semibold text-[#1C1917]"
              >
                <span className="flex items-center gap-2.5">
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>Share via WhatsApp</span>
                </span>
                <ExternalLink className="w-4 h-4 text-zinc-400" />
              </a>

              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-between p-3.5 border border-[#E7E0D5] rounded-xl hover:border-[#722F37] hover:bg-[#FAF7F2] transition-all text-sm font-semibold text-[#1C1917]"
              >
                <span className="flex items-center gap-2.5">
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#722F37]" />}
                  <span>{copied ? 'Link Copied to Clipboard!' : 'Copy Catalog Link'}</span>
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">URL</span>
              </button>

              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello Bhavya Fashions, please send me the latest PDF Wholesale Lookbook & Price List for 2026.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-3.5 bg-[#722F37] text-white rounded-xl hover:bg-[#58111A] transition-all text-sm font-semibold"
              >
                <span className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#C5A059]" />
                  <span>Request Full PDF Price List</span>
                </span>
                <ExternalLink className="w-4 h-4 text-white/70" />
              </a>
            </div>
          </div>

          <div className="pt-6 border-t border-[#E7E0D5] text-center space-y-1">
            <span className="text-[11px] font-semibold text-[#1C1917]">Bhavya Fashions Wholesale</span>
            <p className="text-[10px] text-zinc-500">
              Barabazar, Kolkata • Surat Loom Mills • All-India Transport
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
