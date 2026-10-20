'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Percent,
  Truck,
  ShieldCheck,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  Building2,
  ArrowRight,
  Calculator,
} from 'lucide-react';

interface TierOption {
  id: string;
  name: string;
  volumeRange: string;
  minPcs: number;
  expectedMargin: string;
  multiplier: string;
  perPieceAvgEstimate: string;
  highlights: string[];
  recommendedFor: string;
}

const TIERS: TierOption[] = [
  {
    id: 'starter',
    name: 'Boutique Starter Tier',
    volumeRange: '24 – 60 Pieces',
    minPcs: 24,
    expectedMargin: '80% – 95%',
    multiplier: '1.8x – 1.95x',
    perPieceAvgEstimate: 'Estimated Counter ROI: ₹45,000+',
    highlights: [
      'Standard Ratio Packing (M to 3XL)',
      '24-Hour Express Dispatch from Barabazar',
      'Instant Design Swap within 7 Days',
      'Free High-Res Editorial Photos for Social Media',
    ],
    recommendedFor: 'Independent suburban boutiques & new ethnic wear stores.',
  },
  {
    id: 'established',
    name: 'Prime Retailer Tier',
    volumeRange: '60 – 180 Pieces',
    minPcs: 60,
    expectedMargin: '100% – 125%',
    multiplier: '2.0x – 2.25x',
    perPieceAvgEstimate: 'Estimated Counter ROI: ₹1,40,000+',
    highlights: [
      'Priority Access to Festive New Arrivals',
      'Flexible Ratio Sizing (Custom size mix allowed)',
      'Dedicated Barabazar B2B Account Manager',
      'Direct GST Invoicing with 5% ITC Pass-Through',
    ],
    recommendedFor: 'Multi-rack boutiques, city showrooms & festive season counters.',
  },
  {
    id: 'distributor',
    name: 'Mega Distributor Tier',
    volumeRange: '180+ Pieces',
    minPcs: 180,
    expectedMargin: '130% – 150%',
    multiplier: '2.3x – 2.5x',
    perPieceAvgEstimate: 'Estimated Counter ROI: ₹4,50,000+',
    highlights: [
      'Direct Surat Mill Pricing (Zero Intermediary Cut)',
      'Door-to-Door Insured Freight Freight Subsidy',
      'Custom Brand Tagging & Individual Box Packing',
      'Exclusive Regional Design Lock (Pincode protection)',
    ],
    recommendedFor: 'Wholesale resellers, departmental stores & multi-branch retail chains.',
  },
];

export function WholesaleTierEstimator() {
  const [selectedTier, setSelectedTier] = useState<string>('established');
  const [orderQuantity, setOrderQuantity] = useState<number>(84);

  const tier = TIERS.find((t) => t.id === selectedTier) || TIERS[1];
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919830729210';

  return (
    <section className="py-20 sm:py-28 bg-[#FAF6EE] border-b border-[#E7E0D5] text-[#1C1917]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#722F37]/10 text-[#722F37] text-xs font-semibold uppercase tracking-widest border border-[#722F37]/15">
            <Calculator className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Interactive B2B Procurement Calculator</span>
          </div>

          <h2 className="font-serif-luxury text-4xl sm:text-5xl md:text-6xl font-bold text-[#1C1917] tracking-tight">
            Wholesale Margin & <span className="italic text-[#722F37] font-normal">Profit Tier Estimator</span>
          </h2>

          <p className="text-xs sm:text-base text-[#57534E] font-light leading-relaxed">
            Direct mill sourcing eliminates commission agents and brokers. See how Bhavya Fashions' direct loom pricing boosts your retail counter margins.
          </p>
        </div>

        {/* Interactive Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Tier Selection Tabs & Range Slider */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E7E0D5] p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs uppercase font-mono tracking-wider font-bold text-[#8C6D23] block">
                Step 1: Select Your Boutique Order Scale
              </span>

              {/* 3 Tier Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {TIERS.map((t) => {
                  const isCurrent = t.id === selectedTier;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSelectedTier(t.id);
                        setOrderQuantity(t.minPcs);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${
                        isCurrent
                          ? 'border-[#722F37] bg-[#722F37]/5 shadow-sm ring-2 ring-[#722F37]/20'
                          : 'border-[#E7E0D5] bg-[#FAF7F2] hover:bg-white'
                      }`}
                    >
                      <span className={`text-[10px] font-mono uppercase font-bold block ${
                        isCurrent ? 'text-[#722F37]' : 'text-zinc-500'
                      }`}>
                        {t.volumeRange}
                      </span>
                      <h4 className="font-serif-luxury text-base font-bold text-[#1C1917] mt-1">
                        {t.name}
                      </h4>
                      <span className="text-xs font-bold text-emerald-700 block mt-1">
                        {t.expectedMargin} Margin
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Slider for Order Quantity */}
              <div className="pt-6 border-t border-[#E7E0D5] space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-zinc-700">Estimated Order Volume:</span>
                  <span className="text-base font-mono font-extrabold text-[#722F37]">
                    {orderQuantity} Pieces
                  </span>
                </div>

                <input
                  type="range"
                  min={24}
                  max={300}
                  step={6}
                  value={orderQuantity}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setOrderQuantity(val);
                    if (val < 60) setSelectedTier('starter');
                    else if (val < 180) setSelectedTier('established');
                    else setSelectedTier('distributor');
                  }}
                  className="w-full accent-[#722F37] cursor-pointer"
                />

                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>24 Pcs (Boutique Starter)</span>
                  <span>120 Pcs (Prime Store)</span>
                  <span>300+ Pcs (Distributor)</span>
                </div>
              </div>

              {/* Tier Details Checklist */}
              <div className="pt-6 border-t border-[#E7E0D5] space-y-2.5">
                <span className="text-xs uppercase font-mono tracking-wider font-bold text-zinc-700 block">
                  Included Tier Benefits:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {tier.highlights.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-zinc-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 italic pt-3 border-t border-[#E7E0D5]">
              Target Profile: {tier.recommendedFor}
            </p>
          </div>

          {/* Right Column: Simulated Margin Projection Card */}
          <div className="lg:col-span-5 bg-[#1C1215] text-[#FAF7F2] rounded-3xl p-6 sm:p-8 border-2 border-[#C5A059]/40 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#722F37]/30 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="text-xs uppercase font-mono tracking-widest text-[#C5A059] font-bold">
                  B2B Trade Simulation
                </span>
                <span className="bg-[#C5A059]/20 text-[#E8C581] border border-[#C5A059]/30 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
                  Verified Mill Sourcing
                </span>
              </div>

              <div>
                <span className="text-xs text-zinc-400 block font-light">Expected Boutique Retail Mark-Up:</span>
                <div className="text-4xl sm:text-5xl font-extrabold text-[#E8C581] font-mono tracking-tight mt-1">
                  {tier.expectedMargin}
                </div>
                <span className="text-xs text-zinc-400 block mt-1">
                  Average Price Multiplier: <strong className="text-white">{tier.multiplier}</strong> of wholesale procurement cost
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-[11px] uppercase font-mono tracking-wider text-zinc-400 block">
                  Simulated Profit Potential
                </span>
                <span className="text-sm font-bold text-white block">
                  {tier.perPieceAvgEstimate}
                </span>
                <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
                  Calculated based on average boutique retail sales price of ₹1,199 to ₹1,899 for 3-Piece Muslin & Kesaria Silk sets.
                </p>
              </div>

              <div className="space-y-2 text-xs text-zinc-300">
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span>Standard Dispatch Hub:</span>
                  <strong className="text-white">Barabazar (Kolkata) / Surat</strong>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span>Transit Timeline:</span>
                  <strong className="text-white">24 – 48 Hours Across India</strong>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span>GST Billing:</span>
                  <strong className="text-emerald-400">100% Compliant (5% Rate)</strong>
                </div>
              </div>
            </div>

            {/* Direct CTA */}
            <div className="relative z-10 pt-4 border-t border-white/10 space-y-2">
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                  `Hello Bhavya Fashions, I am interested in procuring at the ${tier.name} (${orderQuantity} pieces). Please share tier pricing and active lookbooks.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold uppercase tracking-wider shadow-lg transition-all"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Request {tier.name} Quote on WhatsApp</span>
              </a>

              <span className="text-[10px] text-center text-zinc-400 block">
                Direct loom trade rates. No middleman markups.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
