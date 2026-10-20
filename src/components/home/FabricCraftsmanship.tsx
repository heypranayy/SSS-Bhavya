'use client';

import React, { useState } from 'react';
import { Sparkles, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface FabricFeature {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  tag: string;
  retailMarkup: string;
  specs: string[];
  image: string;
}

const fabrics: FabricFeature[] = [
  {
    id: 'cambric-cotton',
    name: 'Pure 60-60 Cambric Cotton',
    subtitle: 'Breathable Everyday Luxury',
    description: 'Woven from combed long-staple cotton yarn with azo-free reactive printing. Delivers zero bleeding, pre-shrunk durability, and supreme comfort in humid Indian summers.',
    tag: 'Daily Wear Hit',
    retailMarkup: '70% – 100% Margin',
    specs: ['100% Combed 60s Count Yarn', 'Azo-Free Reactive Dyes', 'Pre-Shrunk & Colorfast', 'Breathable All-Season Fit'],
    image: '/images/hero-cotton-summer.jpg',
  },
  {
    id: 'royal-muslin',
    name: 'Royal Muslin & Viscose Silk',
    subtitle: 'Buttery Softness with Festive Luster',
    description: 'The preferred choice for high-end boutique sets. Combines the featherweight drape of pure muslin with a subtle festive gleam that photographs exquisitely for digital and retail displays.',
    tag: 'Boutique Bestseller',
    retailMarkup: '85% – 130% Margin',
    specs: ['Featherweight Fluid Drape', 'Subtle Natural Sheen', 'Skin-Friendly Natural Fibers', 'Digitally Screen Printed'],
    image: '/images/cat-3piece.jpg',
  },
  {
    id: 'chanderi-silk',
    name: 'Festive Chanderi Silk',
    subtitle: 'Heritage Weave with Zari Motifs',
    description: 'Originating from traditional looms, our Chanderi blends fine silk and cotton with intricate metallic zari border highlights, ideal for Karwa Chauth, Diwali, and wedding counters.',
    tag: 'Wedding & Festive',
    retailMarkup: '90% – 140% Margin',
    specs: ['Traditional Handloom Texture', 'Metallic Gold Zari Accents', 'Festive Occasion Ready', 'Interlock Stitched Seams'],
    image: '/images/hero-chanderi-festive.jpg',
  },
  {
    id: 'organza-cutwork',
    name: 'Hand-Cutwork Organza Dupattas',
    subtitle: 'High Perceived Value Accents',
    description: 'Every 3-piece festive ensemble is crowned with an organza dupatta featuring scalloped floral borders, intricate needlework, and scatter sequins that wow your boutique clientele.',
    tag: 'Signature Finish',
    retailMarkup: 'Premium Tier',
    specs: ['Hand-Scalloped Edges', 'Micro Sequin Scatter', '2.25 to 2.4 Meter Cut', 'Zero Crease Fabric Finish'],
    image: '/images/cat-anarkali.jpg',
  },
];

export function FabricCraftsmanship() {
  const [activeTab, setActiveTab] = useState(0);
  const current = fabrics[activeTab];

  return (
    <section className="py-20 bg-[#FAF7F2] text-[#1C1917] border-b border-[#E7E0D5] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Heading (Wedding Vision Style) */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/20 text-[#722F37] text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Manufacturing Excellence & Quality Control</span>
          </div>

          <h2 className="font-serif-luxury text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#1C1917] leading-tight">
            Heritage Fabrics & <span className="italic text-[#722F37] font-normal">Craftsmanship</span>
          </h2>

          <p className="text-xs sm:text-base text-zinc-600 font-light leading-relaxed">
            We mill and test every batch directly in Surat and Kolkata. No synthetic compromises, no color bleeding, and standard proportional sizing that protects your boutique's reputation.
          </p>
        </div>

        {/* Fabric Tabs Selector */}
        <div className="flex justify-center mb-10 overflow-x-auto pb-2 no-scrollbar">
          <div className="flex gap-2 p-1.5 bg-[#EFE9E0] rounded-2xl border border-[#E7E0D5]">
            {fabrics.map((fabric, idx) => (
              <button
                key={fabric.id}
                onClick={() => setActiveTab(idx)}
                className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap ${
                  activeTab === idx
                    ? 'bg-[#722F37] text-white shadow-md'
                    : 'text-zinc-700 hover:text-zinc-950 hover:bg-white/60'
                }`}
              >
                {fabric.name}
              </button>
            ))}
          </div>
        </div>

        {/* Active Fabric Feature Card */}
        <div className="bg-white rounded-3xl border border-[#E7E0D5] shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all duration-500">
          {/* Image Side */}
          <div className="lg:col-span-5 relative aspect-[4/3] lg:aspect-auto min-h-[300px] lg:min-h-[460px] bg-zinc-100 overflow-hidden">
            <img
              src={current.image}
              alt={current.name}
              className="w-full h-full object-cover object-top transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md text-[#C5A059] font-mono text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {current.tag}
            </div>
            <div className="absolute bottom-4 right-4 bg-[#722F37]/95 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
              {current.retailMarkup}
            </div>
          </div>

          {/* Details Side */}
          <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#722F37] font-semibold">
                {current.subtitle}
              </span>

              <h3 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#1C1917] tracking-tight">
                {current.name}
              </h3>

              <p className="text-xs sm:text-base text-zinc-600 leading-relaxed font-light">
                {current.description}
              </p>

              {/* Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                {current.specs.map((spec, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-zinc-800 bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E7E0D5]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">{spec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Guarantee */}
            <div className="pt-6 border-t border-[#E7E0D5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <ShieldCheck className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>Double-Checked by Factory QC Before Packing</span>
              </div>

              <Link
                href={`/products?search=${encodeURIComponent(current.name)}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#722F37] hover:underline"
              >
                <span>View {current.name} Designs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
