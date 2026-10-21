'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Sparkles } from 'lucide-react';

interface CategoryItem {
  id: string;
  title: string;
  tagline: string;
  image: string;
  href: string;
  designCount: string;
}

const categoryItems: CategoryItem[] = [
  {
    id: '3-piece',
    title: 'Three-Piece Sets (3P)',
    tagline: 'Muslin & Silk Kurti, Pant & Dupatta',
    image: '/images/cat-3piece.jpg',
    href: '/wholesale?category=Three-Piece%20Kurtis%20(3P)#explorer',
    designCount: '48+ Wholesale Designs',
  },
  {
    id: '2-piece',
    title: 'Two-Piece Sets (2P)',
    tagline: 'Matching Kurti & Pant Sets',
    image: '/images/cat-2piece.jpg',
    href: '/wholesale?category=Two-Piece%20Kurtis%20(2P)#explorer',
    designCount: '32+ Wholesale Designs',
  },
  {
    id: 'coord-sets',
    title: 'Contemporary Co-ords',
    tagline: 'Western-Ethnic Fusion Sets',
    image: '/images/cat-coord.jpg',
    href: '/wholesale?category=Co-ord%20Sets#explorer',
    designCount: '24+ Wholesale Designs',
  },
  {
    id: 'anarkalis-gowns',
    title: 'Flared Anarkalis & Gowns',
    tagline: 'Kalidar Festive & Wedding Silhouettes',
    image: '/images/cat-anarkali.jpg',
    href: '/wholesale?category=Anarkalis%20%26%20Gowns#explorer',
    designCount: '18+ Wholesale Designs',
  },
];

export function CategoryShowcase() {
  return (
    <section className="py-16 sm:py-24 bg-[#FAF6F0] text-black w-full overflow-hidden border-b border-[#E7E0D5]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Refined Editorial Typography */}
        <div className="mb-12 sm:mb-16 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#722F37]/10 text-[#722F37] text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Direct Manufacturer Collections</span>
          </div>

          <h2
            className="font-serif-luxury text-4xl sm:text-6xl md:text-[68px] font-bold text-zinc-950 tracking-tight leading-[0.98]"
          >
            Browse by <span className="italic text-[#722F37] font-normal">Category</span>
          </h2>

          <p className="text-xs sm:text-sm text-zinc-600 max-w-xl mx-auto font-light leading-relaxed">
            Curated high-turnaround Indian ethnic wear manufactured for boutiques, retailers, and online resellers.
          </p>
        </div>

        {/* 3D Perspective Card Showcase (Snap-scroll on mobile, 4-col on desktop, like mbaazar) */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 sm:gap-6 pb-6 lg:pb-0 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-x-visible lg:snap-none no-scrollbar">
          {categoryItems.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-2xl sm:rounded-3xl bg-zinc-50 aspect-[3/4] shrink-0 w-[80vw] sm:w-[46vw] snap-center lg:w-auto lg:snap-align-none overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-[#E7E0D5]"
            >
              <figure className="relative w-full h-full [perspective:800px] flex flex-col items-center justify-center">
                <div className="relative [transform-style:preserve-3d] w-full h-full">
                  {/* Card Image */}
                  <img
                    src={item.image}
                    alt={item.title}
                    onError={(e) => {
                      e.currentTarget.src = '/images/cat-3piece.jpg';
                    }}
                    className="absolute top-0 left-0 w-full h-full object-cover object-top will-change-transform [transform:translateZ(0)] group-hover:scale-108 transition-transform duration-700"
                    loading="lazy"
                  />

                  {/* Gradient & Vignette Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent transition-opacity duration-300" />

                  {/* Top Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-black/60 backdrop-blur-md text-[#C5A059] border border-[#C5A059]/40 text-[10px] uppercase font-mono tracking-wider px-2.5 py-1 rounded-full">
                      {item.designCount}
                    </span>
                  </div>

                  {/* 3D Elevated Bottom Interactive Button */}
                  <div className="absolute top-0 left-0 z-[2] w-full h-full will-change-transform [transform:translateZ(30px)] flex flex-col justify-end p-5">
                    <div className="space-y-1 mb-3 text-white">
                      <h3 className="font-serif-luxury text-lg sm:text-xl font-bold tracking-tight">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-white/80 line-clamp-1 font-light">
                        {item.tagline}
                      </p>
                    </div>

                    <Link
                      href={item.href}
                      className="flex items-center justify-between bg-white text-zinc-900 rounded-xl px-4 py-2.5 shadow-md hover:shadow-xl transition-all duration-300 group-hover:bg-[#722F37] group-hover:text-white border border-zinc-200 hover:scale-[1.02]"
                    >
                      <span className="text-xs font-semibold tracking-wide">
                        View Wholesale Lot
                      </span>
                      <ArrowUpRight className="w-4 h-4 transform transition-transform duration-300 group-hover:rotate-45 group-hover:text-[#C5A059]" />
                    </Link>
                  </div>
                </div>
              </figure>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
