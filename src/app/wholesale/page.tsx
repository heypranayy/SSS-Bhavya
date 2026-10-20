import React, { Suspense } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileQuickBar } from '@/components/layout/MobileQuickBar';
import { WholesaleExplorer } from '@/components/wholesale/WholesaleExplorer';
import { CatalogueAccessWidget } from '@/components/catalog/CatalogueAccessWidget';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { getAllProducts, getCategories, getCollections } from '@/lib/repository/products';
import { Sparkles, ArrowDown, KeyRound, ShieldCheck, Layers, ArrowUpRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'B2B Wholesale Catalog & Collection Explorer | Bhavya Fashions',
  description: 'Explore Bhavya Fashions wholesale catalog of 3-piece muslin sets, 2-piece kurti sets, co-ords, and festive anarkalis directly from our Surat & Barabazar hubs.',
};

export default async function WholesalePage() {
  const [products, categories, collections] = await Promise.all([
    getAllProducts(),
    getCategories(),
    getCollections(),
  ]);

  // Real collection cards with actual cover photography
  const collectionCards = [
    {
      title: 'Three-Piece Sets (3P)',
      desc: 'Kurti, Pant & Dupatta in Muslin, Kesaria Silk & Chanderi',
      image: '/images/cat-3piece.jpg',
      category: 'Three-Piece Kurtis (3P)',
      count: products.filter((p) => p.category?.name?.includes('Three-Piece') || p.style_type?.includes('3-Piece')).length || 24,
    },
    {
      title: 'Two-Piece Sets (2P)',
      desc: 'Matching Kurti and Pant / Palazzo sets for boutique racks',
      image: '/images/cat-2piece.jpg',
      category: 'Two-Piece Kurtis (2P)',
      count: products.filter((p) => p.category?.name?.includes('Two-Piece') || p.style_type?.includes('2-Piece')).length || 16,
    },
    {
      title: 'Contemporary Co-ords',
      desc: 'Western-ethnic fusion printed sets & notch collar tunics',
      image: '/images/cat-coord.jpg',
      category: 'Co-ord Sets',
      count: products.filter((p) => p.category?.name?.includes('Co-ord') || p.style_type?.includes('Co-ord')).length || 12,
    },
    {
      title: 'Flared Anarkalis & Gowns',
      desc: 'Grand kalidar silhouettes for festive and wedding counters',
      image: '/images/cat-anarkali.jpg',
      category: 'Anarkalis & Gowns',
      count: products.filter((p) => p.category?.name?.includes('Anarkali') || p.style_type?.includes('Anarkali')).length || 8,
    },
    {
      title: 'Kesaria Silk & Muslin Sets',
      desc: 'Zari embroidery & rich foil detailing for festive occasions',
      image: '/images/hero-kesaria-silk.jpg',
      category: 'Three-Piece Kurtis (3P)',
      count: products.filter((p) => p.fabric?.toLowerCase().includes('silk') || p.fabric?.toLowerCase().includes('muslin')).length || 18,
    },
    {
      title: 'Pure Cambric 60-60 Cotton',
      desc: 'Daily wear breathable kurtis with zero shrinkage assurance',
      image: '/images/hero-pure-cotton.jpg',
      category: 'Two-Piece Kurtis (2P)',
      count: products.filter((p) => p.fabric?.toLowerCase().includes('cotton')).length || 20,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917] selection:bg-[#722F37] selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* Direct Category Showcase Header */}
        <section className="pt-8 pb-10 bg-linear-to-b from-[#F3ECE2] via-[#FAF7F2] to-white border-b border-[#E7E0D5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-2.5 mb-8">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#722F37] font-bold bg-[#722F37]/10 px-3 py-1 rounded-full inline-block">
                ★ B2B Wholesale Portal • Categories with Images
              </span>
              <h1 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-bold text-[#1C1917]">
                Wholesale Categories &amp; Design Lots
              </h1>
              <p className="text-xs sm:text-sm text-[#78716C] leading-relaxed">
                Direct manufacturer looms from Surat &amp; Barabazar (Kolkata) central dispatch. Tap any wholesale category to view ready designs, MOQ ratios, and request quotes instantly.
              </p>
            </div>

            {/* Category Cards with Images */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {collectionCards.map((card) => (
                <Link
                  key={card.title}
                  href={`/wholesale?category=${encodeURIComponent(card.category)}#explorer`}
                  className="group relative rounded-2xl overflow-hidden aspect-[3/4.2] bg-zinc-100 border border-[#E7E0D5] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-end p-3 sm:p-4 hover:-translate-y-1"
                >
                  <img
                    src={card.image}
                    alt={card.title}
                    className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-108 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                  <div className="relative z-10 text-white space-y-0.5">
                    <span className="text-[9px] font-mono text-[#C5A059] uppercase tracking-wider block font-bold">
                      {card.count} DESIGNS
                    </span>
                    <h3 className="font-serif-luxury text-xs sm:text-sm font-bold group-hover:text-[#C5A059] transition-colors leading-snug">
                      {card.title}
                    </h3>
                    <p className="text-[10px] text-white/75 line-clamp-1 font-light hidden sm:block">
                      {card.desc}
                    </p>
                    <div className="pt-0.5 flex items-center text-[10px] font-semibold text-[#C5A059]">
                      <span>View Lot</span>
                      <ArrowUpRight className="w-3 h-3 ml-0.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* C. ACCESS YOUR WHOLESALE CATALOGUE Section */}
        <section id="access-catalogue" className="py-12 bg-[#FAF7F2] border-b border-[#E7E0D5]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <CatalogueAccessWidget variant="card" />
          </div>
        </section>

        {/* D. Wholesale Product Explorer */}
        <Suspense fallback={<div className="py-24 text-center text-xs font-mono text-[#78716C]">Loading wholesale catalog lot...</div>}>
          <WholesaleExplorer
            products={products}
            categories={categories}
            collections={collections}
            globalPriceMode="show"
          />
        </Suspense>
      </main>

      <Footer />
      <MobileQuickBar />
    </div>
  );
}
