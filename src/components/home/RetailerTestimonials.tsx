'use client';

import React from 'react';
import { Sparkles, Star, Quote, MapPin } from 'lucide-react';

const testimonials = [
  {
    quote: "Bhavya Fashions' 3-piece muslin sets fly off our boutique racks within 48 hours of arrival. The fabric handfeel is noticeably richer than standard market lots, and the ratio packing is strictly consistent.",
    author: 'Ananya Gupta',
    role: 'Boutique Owner',
    city: 'South Extension, New Delhi',
    rating: 5,
  },
  {
    quote: "Direct parcel dispatch from Barabazar saves us traveling to Kolkata every month. Their WhatsApp team sends live videos of current stock and issues GST invoices promptly. Essential wholesale partner.",
    author: 'Rajesh Shah',
    role: 'Retail Store Director',
    city: 'Ratanpole, Ahmedabad',
    rating: 5,
  },
  {
    quote: "We regularly achieve 85% to 110% retail margin on Bhavya Fashions' Alia cut and Nayra cut designs. Zero defective pieces across our last 14 consignments.",
    author: 'Priya Rathore',
    role: 'Couture Studio Founder',
    city: 'Civil Lines, Jaipur',
    rating: 5,
  },
  {
    quote: "Our online live sales customers wait eagerly for Bhavya Fashions' weekly catalog drops. The sheer organza cutwork dupattas give every kurti set an ultra-luxurious designer look.",
    author: 'Kavitha Reddy',
    role: 'Fashion Reseller',
    city: 'Jubilee Hills, Hyderabad',
    rating: 5,
  },
];

export function RetailerTestimonials() {
  return (
    <section className="py-20 bg-white text-[#1C1917] border-b border-[#E7E0D5] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#722F37]/10 text-[#722F37] text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Retailer Trust Across India</span>
          </div>

          <h2 className="font-serif-luxury text-3xl sm:text-5xl font-bold tracking-tight text-[#1C1917]">
            Trusted by 5,000+ <span className="italic text-[#722F37] font-normal">Boutiques</span>
          </h2>

          <p className="text-xs sm:text-sm text-zinc-600 font-light">
            Hear from multi-brand outlets, retail boutiques, and reseller networks who rely on Bhavya Fashions for weekly counter refreshes.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-[#FAF7F2] border border-[#E7E0D5] rounded-2xl p-6 flex flex-col justify-between shadow-2xs hover:shadow-lg hover:border-[#C5A059]/60 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-500">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-5 h-5 text-[#C5A059]/40" />
                </div>

                <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed font-light italic">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-6 border-t border-[#E7E0D5] mt-6">
                <span className="font-serif-luxury text-sm font-bold text-[#1C1917] block">
                  {t.author}
                </span>
                <span className="text-[11px] text-[#722F37] font-medium block">
                  {t.role}
                </span>
                <div className="flex items-center gap-1 text-[10px] text-zinc-500 mt-1">
                  <MapPin className="w-3 h-3 text-[#C5A059]" />
                  <span>{t.city}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
