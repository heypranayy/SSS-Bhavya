import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ShieldCheck, Layers, Award, Sparkles, Truck, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'About Our Wholesale Manufacturing & Heritage | Bhavya Fashions',
  description: 'Bhavya Fashions is a dedicated B2B wholesale supplier of Indian ethnic wear, operating from major textile hubs in Barabazar (Kolkata) and Surat.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />

      <main className="flex-1 py-14 lg:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-widest text-[#722F37] font-bold">
              Our B2B Philosophy
            </span>
            <h1 className="font-serif-luxury text-4xl sm:text-5xl font-bold text-[#1C1917] tracking-tight">
              Crafting Excellence for India's <span className="text-[#722F37] italic font-normal">Fashion Retailers</span>
            </h1>
            <p className="text-base text-[#57534E] leading-relaxed">
              Bhavya Fashions was established with a singular focus: to provide apparel retailers, boutique owners, and fashion resellers with dependable, high-turnover Indian ethnic wear directly from manufacturing centers.
            </p>
          </div>

          {/* Two-Column Story */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#E7E0D5] shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=85"
                alt="Bhavya Fashions textile production"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-4 text-sm text-[#44403C] leading-relaxed">
              <h2 className="font-serif-luxury text-2xl font-bold text-[#1C1917]">
                Dual-Hub Manufacturing & Dispatch
              </h2>
              <p>
                Our operations bridge two of India's most celebrated textile epicenters: <strong>Surat</strong>, renowned for its master weaving and high-speed processing, and <strong>Barabazar (Kolkata)</strong>, one of Asia's largest wholesale trading networks.
              </p>
              <p>
                This strategic footprint enables us to source premium 60-60 cambric cottons, pure viscose georgettes, and pure muslin silks at competitive costs, passing substantial margin advantages directly to our wholesale partners.
              </p>
              <div className="pt-2 flex items-center gap-3 text-xs font-semibold text-[#722F37]">
                <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
                <span>Zero retail sales — We never compete with our own retail partners.</span>
              </div>
            </div>
          </div>

          {/* Core Wholesale Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <div className="bg-white p-6 rounded-xl border border-[#E7E0D5] shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] text-[#722F37] flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-serif-luxury text-lg font-bold text-[#1C1917]">
                Quality Guaranteed
              </h3>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Every lot undergoes rigorous colorfastness checks, pre-shrinkage treatment, and precision lock stitching before packing.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#E7E0D5] shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] text-[#722F37] flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-serif-luxury text-lg font-bold text-[#1C1917]">
                Ratio Packing Integrity
              </h3>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Standard proportional size ratios (M, L, XL, XXL) ensure your boutique never runs into excess leftover or unsellable odd sizes.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#E7E0D5] shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] text-[#722F37] flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-serif-luxury text-lg font-bold text-[#1C1917]">
                Swift Logistics
              </h3>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Seamless booking with prominent all-India goods transporters (V-Trans, TCI, SafeXpress, Anjani Courier) with dispatch inside 48 hours.
              </p>
            </div>
          </div>

          {/* CTA Box */}
          <div className="bg-[#FAF7F2] border border-[#E7E0D5] rounded-2xl p-8 text-center space-y-4">
            <h3 className="font-serif-luxury text-2xl font-bold text-[#1C1917]">
              Interested in Becoming an Authorized Wholesale Partner?
            </h3>
            <p className="text-xs text-[#78716C] max-w-xl mx-auto">
              Contact our sales desk or visit our wholesale display counter in Barabazar, Kolkata to evaluate live samples and discuss customized seasonal catalogs.
            </p>
            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#722F37] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5C1D24] transition-all"
              >
                <span>Visit Showroom & Contact Us</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
