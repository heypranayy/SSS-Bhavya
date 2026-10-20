'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  Check,
  Layers,
  Award,
  Flame,
  Droplets,
  Microscope,
  PhoneCall,
  ArrowRight,
} from 'lucide-react';

interface FabricSpec {
  id: string;
  name: string;
  categoryTag: string;
  image: string;
  gsm: string;
  yarnCount: string;
  shrinkageRate: string;
  colorfastnessScore: string;
  finishing: string;
  description: string;
  keyFeatures: string[];
}

const FABRICS: FabricSpec[] = [
  {
    id: 'kesaria-silk',
    name: 'Royal Kesaria Silk',
    categoryTag: 'Signature 3-Piece Silk Ensembles',
    image: '/images/hero-chanderi-festive.jpg',
    gsm: '140 GSM Premium',
    yarnCount: '80D × 80D Micro Spun',
    shrinkageRate: '< 0.5% Dimensional Stability',
    colorfastnessScore: 'Grade 4.8 / 5.0 (Azo-Free Reactive)',
    finishing: 'Lustre Calendared & Soft Washed',
    description:
      'Milled exclusively in Surat with a rich, luminous hand-feel that emulates pure raw silk while retaining heavy embroidery structural stability. Does not crease easily on boutique display hangers.',
    keyFeatures: [
      'Engineered for intricate neck zardozi and gota patti thread work',
      'Non-sheer opaque base requiring minimal lining',
      'Breathable all-season comfort for weddings & festivals',
      'Strict colorfastness guarantee with zero bleeding',
    ],
  },
  {
    id: 'pure-muslin',
    name: 'Feather-Soft Pure Muslin',
    categoryTag: 'Luxury Boutique Everyday Ensembles',
    image: '/images/cat-3piece.jpg',
    gsm: '85 GSM Ultra-Light',
    yarnCount: '100s × 100s Super Combed',
    shrinkageRate: '< 0.8% (Pre-Shrunk Processed)',
    colorfastnessScore: 'Grade 4.7 / 5.0',
    finishing: 'Enzyme Bio-Washed for Feather Touch',
    description:
      'The crown jewel of Indian ethnic comfort. Hand-screened and digitally printed on gossamer pure muslin with scalloped dupattas. Top repeat mover for high-end boutique counters.',
    keyFeatures: [
      'Silky smooth drape with natural air permeability',
      'Gentle on sensitive skin in high humidity climates',
      'Pairs seamlessly with digital printed organza dupattas',
      'High counter sell-through speed (average 3.8 days)',
    ],
  },
  {
    id: 'cambric-cotton',
    name: '60-60 Pure Cambric Cotton',
    categoryTag: 'Volume Office & Daily Wear Kurtis',
    image: '/images/hero-cotton-summer.jpg',
    gsm: '115 GSM Dense Weave',
    yarnCount: '60s × 60s High Density Weave',
    shrinkageRate: '0.0% (Zero Shrinkage Certified)',
    colorfastnessScore: 'Grade 5.0 / 5.0 (Guaranteed)',
    finishing: 'Mercerized for Smooth Texture',
    description:
      'Woven from long-staple Indian cotton on automatic rapier looms. Tested rigorously for repeated commercial launderings, making it the #1 trusted daily wear choice for working women.',
    keyFeatures: [
      'Crisp professional silhouette with wooden button plackets',
      'Tested against piling, fuzzing, and seam slippage',
      'Traditional Bagru, Sanganeri, and geometric print options',
      'High volume repeat ordering across Indian tier-1 & tier-2 cities',
    ],
  },
  {
    id: 'chanderi-organza',
    name: 'Chanderi Silk & Cutwork Organza',
    categoryTag: 'Bridal & Festive Heritage Series',
    image: '/images/cat-anarkali.jpg',
    gsm: '110 GSM Chanderi + 45 GSM Organza',
    yarnCount: 'Silk-Cotton Blend with Metallic Zari',
    shrinkageRate: '< 0.5%',
    colorfastnessScore: 'Grade 4.9 / 5.0',
    finishing: 'Precision Laser Cutwork & Hand Gota',
    description:
      'Traditional royal texture interwoven with delicate gold zari buttis, complemented by sheer scalloped organza dupattas. High visual impact with commanding retail price ceilings.',
    keyFeatures: [
      'Authentic sheer luster with subtle zari highlights',
      'Scalloped cutwork embroidery on all four dupatta borders',
      'Ideal for festive Diwali, Eid, and wedding trousseau racks',
      'Commanding retail markup capability of 120% to 150%',
    ],
  },
];

export function LoomQualityMatrix() {
  const [activeTab, setActiveTab] = useState<string>('kesaria-silk');
  const fabric = FABRICS.find((f) => f.id === activeTab) || FABRICS[0];
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919830729210';

  return (
    <section className="py-20 sm:py-28 bg-white border-b border-[#E7E0D5] text-[#1C1917]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#722F37]/10 text-[#722F37] text-xs font-semibold uppercase tracking-widest border border-[#722F37]/15">
            <Microscope className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Surat Looms & Dyeing Technical Standards</span>
          </div>

          <h2 className="font-serif-luxury text-4xl sm:text-5xl md:text-6xl font-bold text-[#1C1917] tracking-tight">
            Fabric Craftsmanship & <span className="italic text-[#722F37] font-normal">Technical Specifications</span>
          </h2>

          <p className="text-xs sm:text-base text-[#57534E] font-light leading-relaxed">
            Every metre of cloth woven at Bhavya Fashions undergoes strict lab inspection for dimensional shrinkage, tensile strength, and colorfastness.
          </p>
        </div>

        {/* Fabric Switcher Tabs */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-4 mb-8 justify-start lg:justify-center">
          {FABRICS.map((f) => {
            const isActive = f.id === activeTab;
            return (
              <button
                key={f.id}
                onClick={() => setActiveTab(f.id)}
                className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer border ${
                  isActive
                    ? 'bg-[#722F37] text-white border-[#722F37] shadow-md'
                    : 'bg-[#FAF7F2] text-zinc-700 hover:bg-zinc-100 border-[#E7E0D5]'
                }`}
              >
                <span>{f.name}</span>
              </button>
            );
          })}
        </div>

        {/* Detailed Spec Inspection Card */}
        <div className="bg-[#FAF6EE] rounded-3xl border border-[#E7E0D5] p-6 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border-2 border-white">
                <img
                  src={fabric.image}
                  alt={fabric.name}
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#E8C581]">
                    {fabric.categoryTag}
                  </span>
                  <h3 className="font-serif-luxury text-2xl font-bold">{fabric.name}</h3>
                </div>
              </div>
            </div>

            {/* Right Column: Lab Specs & Technical Data Matrix */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#722F37] font-bold block mb-1">
                  Surat Loom Certified Quality
                </span>
                <h3 className="font-serif-luxury text-3xl font-bold text-[#1C1917]">
                  {fabric.name}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 font-light leading-relaxed mt-2">
                  {fabric.description}
                </p>
              </div>

              {/* 4 Technical Data Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                <div className="bg-white p-3.5 rounded-2xl border border-[#E7E0D5] shadow-2xs">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block font-semibold">
                    Fabric Weight / GSM
                  </span>
                  <span className="text-sm font-bold text-[#1C1917] block mt-0.5">
                    {fabric.gsm}
                  </span>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-[#E7E0D5] shadow-2xs">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block font-semibold">
                    Yarn Weave Density
                  </span>
                  <span className="text-sm font-bold text-[#1C1917] block mt-0.5">
                    {fabric.yarnCount}
                  </span>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-[#E7E0D5] shadow-2xs">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block font-semibold">
                    Loom Shrinkage Rating
                  </span>
                  <span className="text-sm font-bold text-emerald-700 block mt-0.5">
                    {fabric.shrinkageRate}
                  </span>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-[#E7E0D5] shadow-2xs">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block font-semibold">
                    Colorfastness Index
                  </span>
                  <span className="text-sm font-bold text-[#722F37] block mt-0.5">
                    {fabric.colorfastnessScore}
                  </span>
                </div>
              </div>

              {/* Quality Checklist */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 block">
                  Retailer Assurance Highlights:
                </span>
                <div className="space-y-1.5">
                  {fabric.keyFeatures.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-zinc-700">
                      <Check className="w-4 h-4 text-[#722F37] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[#E7E0D5] flex flex-wrap gap-3">
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                    `Hello Bhavya Fashions, I would like to request fabric swatches and wholesale catalog for ${fabric.name}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Request Fabric Swatch / Sample</span>
                </a>

                <Link
                  href="/wholesale#explorer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#722F37] hover:bg-[#58111A] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all"
                >
                  <span>Browse {fabric.name} Kurtis</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
