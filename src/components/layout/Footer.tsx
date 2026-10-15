'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, MapPin, Phone, Mail, Clock, ArrowUpRight } from 'lucide-react';

export function Footer() {
  const currentYear = 2026;

  return (
    <footer className="bg-[#1C1917] text-[#E7E0D5] pt-16 pb-12 border-t border-[#3E3835]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#2E2825]">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-serif-luxury text-2xl font-bold tracking-tight text-white">
                BHAVYA <span className="text-[#C5A059] italic font-normal">Fashions</span>
              </span>
              <p className="text-xs uppercase tracking-[0.2em] text-[#A8A29E] mt-0.5">
                Indian Ethnic Wear Wholesale Supplier
              </p>
            </Link>
            <p className="text-sm text-[#A8A29E] leading-relaxed max-w-sm">
              Premier manufacturer and wholesale distributor of designer single kurtis, 2-piece kurti sets, and 3-piece muslin ensembles. Supplying quality-tested apparel directly to boutique owners, multi-brand outlets, and online resellers nationwide.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#C5A059] bg-[#2E2825] px-3 py-2 rounded max-w-fit">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>B2B Only • Trade Verification Applicable</span>
            </div>
          </div>

          {/* Wholesale Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white border-b border-[#2E2825] pb-2">
              Collections
            </h4>
            <ul className="space-y-2 text-sm text-[#A8A29E]">
              <li>
                <Link href="/collections/royal-muslin-3pc" className="hover:text-white transition-colors flex items-center justify-between">
                  <span>Muslin 3-Piece Sets</span>
                </Link>
              </li>
              <li>
                <Link href="/collections/pure-cotton-summer-26" className="hover:text-white transition-colors flex items-center justify-between">
                  <span>60-60 Pure Cotton</span>
                </Link>
              </li>
              <li>
                <Link href="/collections/alia-nayra-cut-hits" className="hover:text-white transition-colors flex items-center justify-between">
                  <span>Alia & Nayra Cuts</span>
                </Link>
              </li>
              <li>
                <Link href="/collections/festive-chanderi-silk" className="hover:text-white transition-colors flex items-center justify-between">
                  <span>Festive Chanderi</span>
                </Link>
              </li>
              <li>
                <Link href="/collections/designer-fusion-coords" className="hover:text-white transition-colors flex items-center justify-between">
                  <span>Designer Co-ord Sets</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Wholesale Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white border-b border-[#2E2825] pb-2">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-[#A8A29E]">
              <li>
                <Link href="/collections" className="hover:text-white transition-colors">
                  Wholesale Catalog
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Our Factory
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Showroom & Dispatch
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors inline-flex items-center gap-1">
                  <span>Admin Login</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Wholesale Hubs & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white border-b border-[#2E2825] pb-2">
              Wholesale Contact
            </h4>
            <div className="space-y-2 text-xs text-[#A8A29E]">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                <span>Barabazar Wholesale Hub, Kolkata & Surat Textile Market</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>+91 98301 22334 / +91 98205 66778</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>wholesale@bhavyafashions.com</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>Mon – Sat: 10:30 AM – 7:30 PM</span>
              </p>
            </div>
          </div>
        </div>

        {/* Legal & B2B Policy Notice */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-[#78716C] gap-4">
          <p>© {currentYear} Bhavya Fashions. All Rights Reserved. Strictly B2B wholesale trade catalog.</p>
          <p className="text-center md:text-right">
            Note: BhavyaFashions.com is an informational wholesale catalog platform. We do not provide consumer shopping cart or online payment gateways.
          </p>
        </div>
      </div>
    </footer>
  );
}
