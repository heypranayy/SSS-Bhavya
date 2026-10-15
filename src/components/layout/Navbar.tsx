'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, PhoneCall, Sparkles, ShieldCheck } from 'lucide-react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'All Collections', href: '/collections' },
    { label: 'About Us', href: '/about' },
    { label: 'Contact & Showroom', href: '/contact' },
  ];

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919830122334';

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E7E0D5] transition-all">
      {/* Top B2B Announcement Bar */}
      <div className="bg-[#722F37] text-[#FAF7F2] text-xs py-1.5 px-4 text-center tracking-wider font-medium flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
        <span>STRICTLY B2B WHOLESALE & BULK SUPPLY — MINIMUM ORDER 6 PIECES PER DESIGN</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex flex-col items-start group">
            <span className="font-serif-luxury text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1917] group-hover:text-[#722F37] transition-colors">
              BHAVYA <span className="text-[#722F37] italic font-normal">Fashions</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#78716C] -mt-1 font-medium">
              Wholesale Kurtis • Direct Manufacturer
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm tracking-wide font-medium transition-colors hover:text-[#722F37] ${
                    isActive ? 'text-[#722F37] font-semibold border-b-2 border-[#722F37] pb-1' : 'text-[#44403C]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center space-x-4">
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello Bhavya Fashions, I am a retailer looking for wholesale kurti catalogs.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-md bg-[#25D366] text-white hover:bg-[#20ba59] transition-all shadow-sm"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>WhatsApp Wholesale</span>
            </a>

            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#78716C] hover:text-[#722F37] transition-colors rounded border border-transparent hover:border-[#E7E0D5]"
            >
              <Sparkles className="w-3 h-3 text-[#C5A059]" />
              <span>Admin Portal</span>
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden items-center gap-3">
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-[#25D366] text-white hover:bg-[#20ba59]"
              aria-label="WhatsApp Us"
            >
              <PhoneCall className="w-4 h-4" />
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-[#1C1917] hover:bg-[#EFE9E0] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF7F2] border-b border-[#E7E0D5] px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive ? 'bg-[#722F37] text-white' : 'text-[#1C1917] hover:bg-[#EFE9E0]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-[#E7E0D5] flex flex-col gap-3">
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello Bhavya Fashions, I want wholesale kurti details.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center py-2.5 rounded-md bg-[#25D366] text-white font-semibold text-sm flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Chat on WhatsApp (+91 98301 22334)</span>
            </a>

            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 text-xs font-semibold text-[#78716C] uppercase tracking-wider hover:text-[#722F37]"
            >
              Admin & Sales Team Portal →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
