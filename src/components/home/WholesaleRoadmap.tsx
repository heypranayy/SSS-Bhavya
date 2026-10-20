'use client';

import React from 'react';
import { Sparkles, PhoneCall, CheckCircle2, PackageCheck, FileSpreadsheet, Truck } from 'lucide-react';

export function WholesaleRoadmap() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919830729210';

  const steps = [
    {
      number: '01',
      title: 'Select Designs & Lots',
      desc: 'Browse our live digital catalog or request a custom PDF curated for your boutique price bracket (₹380 – ₹1,299).',
      icon: FileSpreadsheet,
    },
    {
      number: '02',
      title: 'Confirm Size Ratio (MOQ: 6 pcs)',
      desc: 'Order standard proportional ratio sets (M, L, XL, XXL, 3XL) ensuring full customer fitting options on your shop racks.',
      icon: PackageCheck,
    },
    {
      number: '03',
      title: 'GST Billing & Express Dispatch',
      desc: 'Same-day parcel packing with formal GST invoice, handed over to your preferred national transport or courier from Kolkata / Surat.',
      icon: Truck,
    },
  ];

  return (
    <section className="py-20 bg-white text-[#1C1917] border-b border-[#E7E0D5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF7F2] border border-[#E7E0D5] rounded-3xl p-8 sm:p-14 shadow-md relative overflow-hidden">
          {/* Subtle logo emblem watermark in background */}
          <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none select-none">
            <img src="/images/bhavya-icon.webp" alt="" className="w-96 h-96 object-contain" />
          </div>

          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#722F37]/10 text-[#722F37] text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Straightforward Wholesale Procurement</span>
            </div>

            <h2 className="font-serif-luxury text-3xl sm:text-5xl font-bold tracking-tight text-[#1C1917]">
              How to Partner with <span className="italic text-[#722F37] font-normal">Bhavya Fashions</span>
            </h2>

            <p className="text-xs sm:text-sm text-zinc-600 font-light">
              We empower retail boutique owners with transparent factory wholesale pricing, fast stock replenishment, and zero middle brokers.
            </p>
          </div>

          {/* 3 Step Roadmap Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.number}
                  className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E7E0D5] space-y-4 shadow-2xs hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-9 h-9 rounded-full bg-[#722F37] text-white flex items-center justify-center font-bold text-xs font-mono">
                      {s.number}
                    </span>
                    <Icon className="w-5 h-5 text-[#C5A059]" />
                  </div>

                  <h3 className="font-serif-luxury text-lg font-bold text-[#1C1917]">
                    {s.title}
                  </h3>

                  <p className="text-xs text-zinc-600 leading-relaxed font-light">
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Bottom Bar with Direct WhatsApp Action */}
          <div className="mt-12 pt-8 border-t border-[#E7E0D5] flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            <div className="text-xs text-zinc-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Barabazar (Kolkata) & Surat Warehouses • Trusted by 5,000+ Stores</span>
            </div>

            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello Bhavya Fashions, I want to register as a retail boutique partner and receive wholesale pricing.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#20ba59] shadow-md transition-all hover:scale-102"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Connect with Sales Desk</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
