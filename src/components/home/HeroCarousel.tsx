'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  PhoneCall,
  Sparkles,
  ShieldCheck,
  Pause,
  Play,
  KeyRound,
  ArrowDown,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export interface HeroSlide {
  id: string;
  badge: string;
  titlePrefix: string;
  titleHighlight: string;
  titleSuffix?: string;
  subtitle: string;
  priceNote: string;
  image: string;
  mobileImage: string;
  stepNumber: string;
  stepLabel: string;
  stepTag: string;
  metrics: string[];
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'heritage-trio',
    badge: 'DIRECT FACTORY LOOMS • SURAT & BARABAZAR HUB',
    titlePrefix: 'India\'s Epicentre of Luxury',
    titleHighlight: 'Ethnic Kurti Wholesale',
    titleSuffix: 'for Modern Boutiques',
    subtitle:
      'Direct loom manufacturing supplying 5,000+ premium retail boutiques nationwide. Handcrafted 3-Piece Muslin & Kesaria Silk ensembles engineered for 80% to 140% counter profit margins.',
    priceNote: 'Quote on Request • MOQ 6 Pcs Ratio',
    image: '/images/hero-kesaria-silk.jpg',
    mobileImage: '/images/hero-kesaria-silk-mobile.jpg',
    stepNumber: '01',
    stepLabel: 'Royal Kesaria 3P',
    stepTag: 'Kesaria Silk & Muslin',
    metrics: ['MOQ: 6 Pcs Ratio Pack', 'Direct Loom Trade Rates', 'Barabazar Express Dispatch'],
  },
  {
    id: 'festive-bridal-trio',
    badge: 'FESTIVE & WEDDING 2026 • HIGH MARGIN HIT',
    titlePrefix: 'Grand Kalidar Silhouettes for',
    titleHighlight: 'Peak Bridal Counters',
    titleSuffix: '& Festive Seasons',
    subtitle:
      'Intricate hand zardozi yokes, heavy gota patti borders, and scalloped organza cutwork dupattas in high-demand festive pastels that sell out within 48 hours of counter display.',
    priceNote: 'Quote on Request • MOQ 6 Pcs Ratio',
    image: '/images/hero-festive-zari.jpg',
    mobileImage: '/images/hero-festive-zari-mobile.jpg',
    stepNumber: '02',
    stepLabel: 'Festive & Bridal',
    stepTag: 'Chanderi & Organza',
    metrics: ['Heavy Zardozi Yokes', 'Scalloped Cutwork Dupattas', 'Sizes M to 3XL Ready'],
  },
  {
    id: 'cambric-cotton-trio',
    badge: '60-60 PURE CAMBRIC COTTON • VOLUME REPEAT',
    titlePrefix: 'Breathable Daily Wear Kurtis',
    titleHighlight: 'Engineered for Volume',
    titleSuffix: '& Zero Shrinkage',
    subtitle:
      'Authentic Jaipuri hand-block look prints, contemporary notched-collar co-ord sets, and office-wear 2-piece tunics with zero fabric shrinkage and repeat boutique counter orders.',
    priceNote: 'Quote on Request • MOQ 8 Pcs Ratio',
    image: '/images/hero-pure-cotton.jpg',
    mobileImage: '/images/hero-pure-cotton-mobile.jpg',
    stepNumber: '03',
    stepLabel: 'Pure Cambric Cotton',
    stepTag: '60-60 Daily Co-ords',
    metrics: ['100% Cambric 60-60', 'Shrinkage & Bleed Tested', 'Rapid Repeat Velocity'],
  },
  {
    id: 'royal-jewel-trio',
    badge: 'B2B WHOLESALE EXCLUSIVE • ZERO MIDDLEMEN',
    titlePrefix: 'Direct Manufacturer Sourcing with',
    titleHighlight: 'Zero Intermediary Margins',
    titleSuffix: 'Guaranteed',
    subtitle:
      'Cut out broker commissions. Procure directly from Surat looms with locked GST invoicing, dedicated B2B account managers, and verified door-to-door freight dispatch across India.',
    priceNote: 'Trade Tier Quote • GST Compliant',
    image: '/images/hero-royal-chanderi.jpg',
    mobileImage: '/images/hero-royal-chanderi-mobile.jpg',
    stepNumber: '04',
    stepLabel: 'Direct Loom Trade',
    stepTag: 'Zero Broker Margin',
    metrics: ['Verified GST Invoicing', 'Barabazar Showroom Inspection', 'Dedicated Account Desk'],
  },
];

const SLIDE_DURATION = 6500; // 6.5s per banner

interface HeroCarouselProps {
  variant?: 'homepage' | 'wholesale';
}

export function HeroCarousel({ variant = 'homepage' }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919830729210';
  const currentSlide = HERO_SLIDES[currentIndex];

  // Preload all banner images immediately to prevent layout shifts
  useEffect(() => {
    HERO_SLIDES.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
      const mImg = new Image();
      mImg.src = slide.mobileImage;
    });
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    setProgress(0);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    setProgress(0);
  }, []);

  // Timeline Progress Loop (60fps requestAnimationFrame)
  useEffect(() => {
    if (isPaused) return;

    let animId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;

      setProgress((prev) => {
        const next = prev + (delta / SLIDE_DURATION) * 100;
        if (next >= 100) {
          setCurrentIndex((curr) => (curr + 1) % HERO_SLIDES.length);
          return 0;
        }
        return next;
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, currentIndex]);

  // Keyboard Navigation (ArrowLeft, ArrowRight, Space for pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const exploreUrl = variant === 'wholesale' ? '#explorer' : '/wholesale';
  const accessUrl = variant === 'wholesale' ? '#access-catalogue' : '/wholesale#access-catalogue';

  return (
    <section
      className="relative w-full bg-[#FAF6EE] text-[#1C1917] overflow-hidden select-none border-b border-[#E7E0D5]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Bhavya Fashions Wholesale Editorial Lookbook"
    >
      {/* Light & Warm Palatial Ambient Glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#C5A059]/15 rounded-full blur-3xl pointer-events-none z-10" />
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-[#722F37]/8 rounded-full blur-3xl pointer-events-none z-10" />

      {/* Cinematic Banner Background Showcase */}
      <div className="relative w-full min-h-[620px] sm:min-h-[680px] md:min-h-[720px] lg:min-h-[760px] xl:min-h-[820px] flex items-end md:items-center">
        {HERO_SLIDES.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
              aria-hidden={!isActive}
            >
              {/* Responsive Picture: Dedicated Mobile Portrait Image (9:16) on mobile vs 16:9 Landscape on Desktop */}
              <picture className="w-full h-full block">
                <source media="(max-width: 767px)" srcSet={slide.mobileImage} />
                <img
                  src={slide.image}
                  alt={`${slide.stepLabel} - Bhavya Fashions Wholesale`}
                  className={`w-full h-full object-cover object-top md:object-[82%_center] lg:object-right transform transition-transform duration-[8000ms] ease-out will-change-transform ${
                    isActive ? 'scale-105' : 'scale-100'
                  }`}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
              </picture>

              {/* Contrast Overlays: Desktop soft left glow vs Mobile subtle bottom-only gradient (kurti is 100% visible and bright!) */}
              <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#FAF6EE]/85 via-[#FAF6EE]/25 via-45% to-transparent pointer-events-none" />
              <div className="md:hidden absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-[#E8C581]/5 mix-blend-soft-light pointer-events-none" />
            </div>
          );
        })}

        {/* Content Overlay Container */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 pt-16 sm:py-16 lg:py-20 flex items-end md:items-center">
          {/* Desktop Rich Card - Only shown on md and larger viewports */}
          <div className="hidden md:block w-full max-w-lg lg:max-w-[530px] bg-white/80 backdrop-blur-md p-6 sm:p-7 rounded-3xl border border-white/80 shadow-xl space-y-4">
            {/* Top Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#C5A059]/40 text-[#722F37] text-xs font-semibold uppercase tracking-widest shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="line-clamp-1">{currentSlide.badge}</span>
            </div>

            {/* Editorial Command Headline */}
            <h1 className="font-serif-luxury text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#1C1917] tracking-tight leading-[1.08] drop-shadow-xs">
              {currentSlide.titlePrefix}{' '}
              <span className="italic font-normal text-[#722F37] font-serif-luxury underline decoration-[#C5A059] underline-offset-8">
                {currentSlide.titleHighlight}
              </span>{' '}
              {currentSlide.titleSuffix}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-[#44403C] font-light leading-relaxed max-w-2xl drop-shadow-xs">
              {currentSlide.subtitle}
            </p>

            {/* Value Metrics Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {currentSlide.metrics.map((metric, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-md border border-[#E7E0D5] text-[#292524] text-xs font-medium shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{metric}</span>
                </span>
              ))}
            </div>

            {/* CTAs & Pricing Badge */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              {/* Direct Factory Rate Badge */}
              <div className="bg-white/95 backdrop-blur-md border border-[#C5A059]/60 px-4 py-2 rounded-xl text-[#1C1917] shadow-2xs">
                <span className="text-[9px] uppercase font-mono tracking-widest text-[#8C6D23] block font-bold">
                  Direct Factory Pricing
                </span>
                <span className="text-sm font-extrabold text-[#722F37]">
                  {currentSlide.priceNote}
                </span>
              </div>

              {/* Primary Action Button */}
              {variant === 'wholesale' ? (
                <a
                  href="#explorer"
                  className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-[#722F37] hover:bg-[#58111A] text-white text-xs sm:text-sm uppercase tracking-wider font-bold shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <span>Explore Collections</span>
                  <ArrowDown className="w-4 h-4" />
                </a>
              ) : (
                <Link
                  href="/wholesale"
                  className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-[#722F37] hover:bg-[#58111A] text-white text-xs sm:text-sm uppercase tracking-wider font-bold shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <span>Explore Collections</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              {/* Access Catalogue with Code Button */}
              <a
                href={accessUrl}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-[#FAF6EE] border border-[#E7E0D5] hover:border-[#722F37] text-[#1C1917] text-xs sm:text-sm uppercase tracking-wider font-bold transition-all duration-200 shadow-2xs"
              >
                <KeyRound className="w-4 h-4 text-[#C5A059]" />
                <span>Access with Code</span>
              </a>

              {/* Direct WhatsApp Inquiry Button */}
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                  `Hello Bhavya Fashions, I am inquiring about wholesale quotation for the ${currentSlide.stepLabel} (${currentSlide.stepTag}) collection.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs sm:text-sm uppercase tracking-wider font-bold shadow-md transition-all duration-200"
                title="Chat with Wholesale Desk"
              >
                <PhoneCall className="w-4 h-4" />
                <span>WhatsApp Quote</span>
              </a>
            </div>
          </div>

          {/* Mobile Sleek Minimal Action Pills - ZERO card blocking the kurti! Models & Kurtis are 100% visible! */}
          <div className="md:hidden w-full flex flex-col items-center gap-2.5 pb-1">
            <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/25 text-white text-[10px] font-mono tracking-wider font-bold flex items-center gap-1.5 shadow-md">
              <Sparkles className="w-3 h-3 text-[#C5A059]" />
              <span>{currentSlide.stepLabel} • Quote on Request</span>
            </div>

            <div className="flex items-center gap-2.5 w-full max-w-sm justify-center">
              {variant === 'wholesale' ? (
                <a
                  href="#explorer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-full bg-[#722F37] text-white text-xs font-bold uppercase tracking-wider shadow-xl hover:bg-[#5C1D24] border border-white/20 active:scale-95 transition-transform"
                >
                  <span>Explore Lot</span>
                  <ArrowDown className="w-3.5 h-3.5" />
                </a>
              ) : (
                <Link
                  href="/wholesale"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-full bg-[#722F37] text-white text-xs font-bold uppercase tracking-wider shadow-xl hover:bg-[#5C1D24] border border-white/20 active:scale-95 transition-transform"
                >
                  <span>Explore Lot</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}

              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                  `Hello Bhavya Fashions, I want wholesale kurti quotation for ${currentSlide.stepLabel}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 py-3 px-5 rounded-full bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider shadow-xl border border-white/20 active:scale-95 transition-transform"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Quote</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* TIMELINE NAVIGATION BAR ("Banners Moving in Timeline" - Light Warm Styling) */}
      <div className="relative z-30 w-full bg-[#FAF6EE]/95 backdrop-blur-xl border-t border-[#E7E0D5] px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Timeline Nodes Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 flex-1">
            {HERO_SLIDES.map((slide, idx) => {
              const isActive = idx === currentIndex;
              const isPast = idx < currentIndex;

              // Timeline Progress Fill Calculation
              let progressPercent = 0;
              if (isPast) {
                progressPercent = 100;
              } else if (isActive) {
                progressPercent = progress;
              }

              return (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(idx)}
                  className={`relative text-left p-2.5 sm:p-3 rounded-xl transition-all duration-300 group cursor-pointer ${
                    isActive
                      ? 'bg-white border-2 border-[#722F37] shadow-sm ring-2 ring-[#722F37]/10'
                      : 'bg-white/60 hover:bg-white border border-[#E7E0D5]'
                  }`}
                  aria-label={`Jump to slide ${slide.stepNumber}: ${slide.stepLabel}`}
                >
                  {/* Step Header */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-mono font-bold transition-colors ${
                          isActive ? 'text-[#722F37]' : 'text-zinc-500 group-hover:text-zinc-800'
                        }`}
                      >
                        {slide.stepNumber}
                      </span>
                      <span className="text-[10px] text-zinc-400">/</span>
                      <span
                        className={`text-xs font-bold truncate transition-colors ${
                          isActive ? 'text-[#1C1917]' : 'text-zinc-600 group-hover:text-zinc-900'
                        }`}
                      >
                        {slide.stepLabel}
                      </span>
                    </div>

                    <span className="hidden xl:inline-block text-[10px] font-mono text-[#8C6D23] uppercase font-semibold">
                      {slide.stepTag}
                    </span>
                  </div>

                  {/* Animated Progress Bar Track */}
                  <div className="w-full h-1.5 bg-[#EAE4D9] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#722F37] to-[#C5A059] transition-[width] ease-linear"
                      style={{
                        width: `${progressPercent}%`,
                        transitionDuration: isActive && !isPaused ? '100ms' : '0ms',
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Timeline Playback Controls & Status */}
          <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-[#E7E0D5]">
            {/* Play / Pause Toggle Button */}
            <button
              onClick={() => setIsPaused((p) => !p)}
              className="p-2 rounded-lg bg-white hover:bg-[#FAF6EE] text-[#1C1917] border border-[#E7E0D5] transition-colors flex items-center gap-1.5 text-xs font-mono shadow-2xs"
              aria-label={isPaused ? 'Resume Timeline Auto-play' : 'Pause Timeline Auto-play'}
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 text-[#722F37]" />
                  <span className="hidden sm:inline text-zinc-600 font-semibold">Play</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 text-[#722F37]" />
                  <span className="hidden sm:inline text-zinc-600 font-semibold">Pause</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
