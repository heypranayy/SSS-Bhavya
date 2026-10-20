'use client';

import React from 'react';
import { CalendarDays, MapPinned, Store, Users, Sparkles, ShieldCheck } from 'lucide-react';

const stats = [
  {
    number: '01',
    stat: '20+',
    label: 'Our Heritage',
    sub: 'Years of direct loom manufacturing excellence and trusted wholesale supply across generations.',
    icon: CalendarDays,
  },
  {
    number: '02',
    stat: '5,000+',
    label: 'Boutique Partners',
    sub: 'Independent boutiques, multi-brand outlets, and online sellers connected in 180+ Indian cities.',
    icon: Users,
  },
  {
    number: '03',
    stat: '2,000+',
    label: 'Catalog Designs',
    sub: 'Active fast-moving single kurtis, 2-piece and 3-piece sets in standard size ratio packing (M–3XL).',
    icon: Store,
  },
  {
    number: '04',
    stat: '80-140%',
    label: 'Retail Markup Potential',
    sub: 'Healthy profit margin enabled by eliminating middle agents with direct factory pricing tiers.',
    icon: Sparkles,
  },
];

export function LegacyStackingCards() {
  return (
    <section id="legacy" className="relative py-20 px-4 sm:px-8 lg:px-12 bg-[#0E0B0C] text-white w-full overflow-hidden border-b border-[#2D1B20]">
      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 left-10 w-96 h-96 rounded-full bg-[#722F37]/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-[#C5A059]/15 blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left Column (Sticky Heading & Brand Narrative) */}
          <div className="flex flex-col justify-center space-y-6 lg:sticky lg:top-[24vh] h-fit">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/30 text-[#C5A059] text-xs font-semibold uppercase tracking-widest max-w-fit">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Surat Looms • Kolkata Barabazar Wholesale Hub</span>
            </div>

            <h2 className="font-serif-luxury text-4xl sm:text-6xl md:text-[76px] font-bold text-white tracking-tight leading-[1.05]">
              <span>Redefining</span>
              <span className="italic block text-[#C5A059] font-normal">
                Ethnic Wholesale
              </span>
            </h2>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-light max-w-xl">
              For over two decades, Bhavya Fashions has bridged the raw loom manufacturing strength of Surat with the historic trading heartbeat of Barabazar, Kolkata. We manufacture and supply high-turnaround Indian ethnic wear directly to retail counters, eliminating wholesale brokers and ensuring guaranteed fabric purity, precise ratio packing, and dependable same-day transport booking.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>GST Registered B2B Billing</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
                <span>Zero Middlemen Factory Rate</span>
              </div>
            </div>
          </div>

          {/* Right Column (Stacking Sticky Cards, inspired by mbaazar) */}
          <div className="relative w-full flex flex-col items-center gap-6 pb-16 lg:pb-28">
            {stats.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.number}
                  className="sticky flex items-center justify-center w-full transition-all duration-300"
                  style={{ top: `calc(16vh + ${index * 24}px)` }}
                >
                  <div className="rounded-3xl relative origin-top flex flex-col justify-between h-[320px] sm:h-[350px] w-full max-w-[560px] overflow-hidden border border-[#C5A059]/40 bg-gradient-to-br from-[#2D1217]/98 via-[#1A0B0E]/98 to-[#120709]/98 backdrop-blur-2xl p-7 sm:p-10 shadow-2xl hover:border-[#C5A059] transition-all duration-300">
                    {/* Big Watermark Number */}
                    <div className="absolute right-6 top-2 text-7xl sm:text-9xl md:text-[160px] leading-none font-black text-white/[0.04] pointer-events-none select-none font-serif-luxury">
                      {item.number}
                    </div>

                    {/* Glowing Accent Corner */}
                    <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#722F37]/20 blur-2xl" />

                    {/* Top Row: Label & Icon */}
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-[11px] uppercase tracking-[0.3em] font-mono text-[#C5A059]">
                        {item.label}
                      </span>
                      <div className="w-10 h-10 rounded-full bg-[#C5A059]/15 flex items-center justify-center text-[#C5A059]">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Bottom Content: Stat & Description */}
                    <div className="relative z-10">
                      <h3 className="text-5xl sm:text-7xl font-extrabold text-white tracking-tight">
                        {item.stat}
                      </h3>
                      <div className="mt-3 w-16 h-0.5 bg-gradient-to-r from-[#C5A059] to-transparent" />
                      <p className="mt-4 sm:mt-6 text-white/75 leading-relaxed text-xs sm:text-sm font-light max-w-sm">
                        {item.sub}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
