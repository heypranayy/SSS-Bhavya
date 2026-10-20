'use client';

import React from 'react';
import {
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  Building2,
  PhoneCall,
  Calendar,
  CheckCircle2,
  Package,
} from 'lucide-react';

const REGIONS = [
  {
    name: 'Eastern India Hub',
    states: 'West Bengal, Bihar, Jharkhand, Odisha',
    transit: '24 Hours Express',
    dispatchPoint: 'Barabazar Depot, Kolkata',
    status: 'Daily Direct Delivery',
  },
  {
    name: 'Northern India Hub',
    states: 'Delhi NCR, Uttar Pradesh, Rajasthan, Punjab, Haryana',
    transit: '36 – 48 Hours',
    dispatchPoint: 'Surat Looms & Barabazar Rail',
    status: 'Verified Transit Insured',
  },
  {
    name: 'Western India Hub',
    states: 'Maharashtra (Mumbai/Pune), Gujarat (Surat/Ahmedabad), MP',
    transit: '24 – 36 Hours',
    dispatchPoint: 'Surat Ring Road Loom Depot',
    status: 'Same-Day Dispatch',
  },
  {
    name: 'Southern & NE India Hub',
    states: 'Karnataka, Telangana, AP, Tamil Nadu, Assam, Tripura',
    transit: '48 – 72 Hours',
    dispatchPoint: 'Express Air & Surface Freight',
    status: 'Doorstep Courier Delivery',
  },
];

export function DistributionHubs() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919830729210';

  return (
    <section className="py-20 sm:py-28 bg-[#FAF6EE] border-b border-[#E7E0D5] text-[#1C1917]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#722F37]/10 text-[#722F37] text-xs font-semibold uppercase tracking-widest border border-[#722F37]/15">
            <Truck className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Nationwide Wholesale Logistics Network</span>
          </div>

          <h2 className="font-serif-luxury text-4xl sm:text-5xl md:text-6xl font-bold text-[#1C1917] tracking-tight">
            Surat Looms to <span className="italic text-[#722F37] font-normal">Barabazar Hub Direct Dispatch</span>
          </h2>

          <p className="text-xs sm:text-base text-[#57534E] font-light leading-relaxed">
            Eliminating multi-layer transit delays. Direct freight lines connected from our Surat production mills to our Barabazar wholesale depot, delivering door-to-door across 5,000+ Indian pincodes.
          </p>
        </div>

        {/* 2 Primary Infrastructure Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Pillar 1: Surat Loom Manufacturing */}
          <div className="bg-white rounded-3xl border border-[#E7E0D5] p-8 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#722F37]/10 flex items-center justify-center text-[#722F37]">
                <Building2 className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#8C6D23] font-bold block">
                  Production & Weaving Epicentre
                </span>
                <h3 className="font-serif-luxury text-2xl font-bold text-[#1C1917] mt-0.5">
                  Surat Looms & Dyeing Depot (Gujarat)
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-zinc-600 font-light leading-relaxed">
                Over 120 automated looms producing daily collections in Kesaria Silk, Cambric Cotton, and Pure Muslin. Automated ratio sorting, barcoding, and heavy festival volume manufacturing.
              </p>

              <div className="space-y-2 text-xs text-zinc-700 pt-2 border-t border-[#E7E0D5]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>50,000+ Meters Daily Weaving Capacity</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Standard Ratio Pack Sortation (M, L, XL, XXL, 3XL)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Direct GST Invoicing with 5% ITC Pass-Through</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E7E0D5] flex items-center justify-between text-xs">
              <span className="text-zinc-500">Facility Type:</span>
              <span className="font-bold text-[#1C1917]">Integrated Loom & Dyeing Unit</span>
            </div>
          </div>

          {/* Pillar 2: Barabazar Wholesale Commercial Depot */}
          <div className="bg-white rounded-3xl border border-[#E7E0D5] p-8 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#C5A059]/15 flex items-center justify-center text-[#8C6D23]">
                <Package className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#8C6D23] font-bold block">
                  Commercial Wholesale Trade Hub
                </span>
                <h3 className="font-serif-luxury text-2xl font-bold text-[#1C1917] mt-0.5">
                  Barabazar Wholesale Showroom (Kolkata)
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-zinc-600 font-light leading-relaxed">
                Located in the heart of Asia's largest textile market. Physical inspection counter where boutique owners and retail buyers can touch fabric samples, examine embroidery, and take immediate delivery.
              </p>

              <div className="space-y-2 text-xs text-zinc-700 pt-2 border-t border-[#E7E0D5]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Live Physical Showroom & Inspection Counter</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Same-Day Parcel Dispatch to Eastern & Northern India</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Dedicated VIP Buyer Desks & Regional Account Managers</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E7E0D5] flex items-center justify-between text-xs">
              <span className="text-zinc-500">Visiting Hours:</span>
              <span className="font-bold text-[#722F37]">Mon – Sat: 10:30 AM – 8:00 PM</span>
            </div>
          </div>
        </div>

        {/* Regional Transit Network Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {REGIONS.map((region, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-[#E7E0D5] p-5 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-[#722F37]">
                  {region.status}
                </span>
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
              </div>

              <h4 className="font-serif-luxury text-lg font-bold text-[#1C1917]">
                {region.name}
              </h4>

              <div className="text-xs text-zinc-600 space-y-1">
                <span className="text-zinc-400 block text-[10px] uppercase font-mono">Coverage:</span>
                <p className="line-clamp-2 leading-relaxed">{region.states}</p>
              </div>

              <div className="pt-3 border-t border-[#E7E0D5] flex items-center justify-between text-xs">
                <span className="text-zinc-500">Transit:</span>
                <span className="font-bold text-emerald-700">{region.transit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Barabazar Visit Booking & WhatsApp Consultation CTA */}
        <div className="bg-[#1C1215] text-[#FAF7F2] rounded-3xl p-8 sm:p-12 border-2 border-[#C5A059]/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs uppercase font-mono tracking-widest text-[#C5A059] font-bold">
              Showroom Visit & Consignment Freight
            </span>
            <h3 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white">
              Visiting Barabazar or Need Transport Logistics?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 font-light max-w-xl">
              Connect with our Barabazar dispatch team on WhatsApp to coordinate transport agency LR numbers, private showroom previews, or direct loom dispatches.
            </p>
          </div>

          <div className="shrink-0 flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                'Hello Bhavya Fashions, I would like to schedule a visit to your Barabazar showroom and inquire about freight logistics.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold uppercase tracking-wider shadow-lg transition-all"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Connect with Barabazar Desk</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
