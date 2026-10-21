import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileQuickBar } from '@/components/layout/MobileQuickBar';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { CategoryShowcase } from '@/components/home/CategoryShowcase';
import { LegacyStackingCards } from '@/components/home/LegacyStackingCards';
import { TrendingLookbook } from '@/components/home/TrendingLookbook';
import { WholesaleTierEstimator } from '@/components/home/WholesaleTierEstimator';
import { LoomQualityMatrix } from '@/components/home/LoomQualityMatrix';
import { DistributionHubs } from '@/components/home/DistributionHubs';
import { CatalogueAccessWidget } from '@/components/catalog/CatalogueAccessWidget';
import { WholesaleRoadmap } from '@/components/home/WholesaleRoadmap';
import { getAllProducts, getCollections } from '@/lib/repository/products';
import migratedBlogs from '@/lib/data/migrated-blogs.json';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  PhoneCall,
  ArrowUpRight,
  BookOpen,
  MapPin,
} from 'lucide-react';

export default async function HomePage() {
  const [products, collections] = await Promise.all([
    getAllProducts(),
    getCollections(),
  ]);

  const featuredCollections = collections.slice(0, 4);
  const featuredBlogs = migratedBlogs.slice(0, 3);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919830729210';

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917] selection:bg-[#722F37] selection:text-white">
      {/* 0. Header with infinite ticker & logo */}
      <Navbar />

      <main className="flex-1">
        {/* 1. Premium fashion hero */}
        <HeroCarousel />

        {/* 2. Wholesale collections */}
        <section className="py-16 bg-white border-b border-[#E7E0D5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#722F37] font-bold">
                  Curated Catalog Series
                </span>
                <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#1C1917] mt-1">
                  Wholesale Collections
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 font-light mt-1">
                  Milled and curated specifically for boutique counters and fast inventory turnaround.
                </p>
              </div>

              <Link
                href="/wholesale"
                className="mt-4 md:mt-0 text-xs font-bold text-[#722F37] uppercase tracking-wider flex items-center gap-1.5 hover:underline"
              >
                <span>View All Collections in Explorer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredCollections.map((col) => (
                <Link
                  key={col.id}
                  href={`/wholesale?collection=${col.slug}#explorer`}
                  className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-zinc-100 shadow-sm hover:shadow-2xl transition-all duration-500 border border-[#E7E0D5] flex flex-col justify-end p-6"
                >
                  {col.image_url && (
                    <img
                      src={col.image_url}
                      alt={col.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-106 transition-transform duration-700"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                  <div className="relative z-10 text-white space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A059] block">
                      {col.product_count || 12}+ Active Designs
                    </span>
                    <h3 className="font-serif-luxury text-xl font-bold group-hover:text-[#C5A059] transition-colors">
                      {col.name}
                    </h3>
                    <p className="text-xs text-white/80 line-clamp-2 leading-relaxed font-light">
                      {col.description}
                    </p>
                    <div className="pt-2 flex items-center text-xs font-semibold text-white group-hover:text-[#C5A059] group-hover:translate-x-1 transition-all">
                      <span>Explore Wholesale Lot</span>
                      <ArrowUpRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Featured categories such as 2P and 3P based on actual data */}
        <CategoryShowcase />

        {/* 4. New arrivals & 5. Featured wholesale products with working category swapper, Quick View & Quote on Request */}
        <TrendingLookbook initialProducts={products} />

        {/* 6. B2B Wholesale Margin & Profit Tier Calculator */}
        <WholesaleTierEstimator />

        {/* 7. Surat Looms Technical Quality & Fabric Specifications Matrix */}
        <LoomQualityMatrix />

        {/* 8. Browse the complete wholesale catalogue (Editorial Callout) */}
        <section className="py-16 bg-[#FAF7F2] border-b border-[#E7E0D5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#1C1215] text-[#FAF7F2] rounded-3xl p-8 sm:p-12 border border-[#C5A059]/40 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#722F37]/30 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-3 max-w-xl text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/30 text-[#C5A059] text-xs font-semibold uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>B2B Wholesale Explorer</span>
                </div>
                <h3 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-white tracking-tight leading-snug">
                  Browse the Complete Wholesale Catalogue
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
                  Search by authentic DN numbers, filter by fabric, size, and style, select multiple designs, and export your curated requirements straight to our WhatsApp wholesale team.
                </p>
              </div>

              <div className="relative z-10 shrink-0">
                <Link
                  href="/wholesale#explorer"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#C5A059] text-[#1C1215] text-xs font-bold uppercase tracking-wider hover:bg-[#d8b46e] transition-all shadow-xl hover:scale-105"
                >
                  <span>Launch Wholesale Explorer</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 9. Brand story and relevant Surat looms stacking cards */}
        <LegacyStackingCards />

        {/* 10. Surat Looms to Barabazar Hub & Nationwide Transit Network */}
        <DistributionHubs />

        {/* 11. Access catalogue by code */}
        <section className="py-20 bg-white border-b border-[#E7E0D5]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <CatalogueAccessWidget variant="card" />
          </div>
        </section>

        {/* 9. Blog and editorial section */}
        {featuredBlogs.length > 0 && (
          <section className="py-16 bg-white border-b border-[#E7E0D5]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#722F37] font-bold">
                    Trade Insights & Lookbook Articles
                  </span>
                  <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#1C1917] mt-1">
                    Wholesale Fashion Blog
                  </h2>
                </div>
                <Link
                  href="/blog"
                  className="mt-4 md:mt-0 text-xs font-bold text-[#722F37] uppercase tracking-wider flex items-center gap-1.5 hover:underline"
                >
                  <span>Read All Articles</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredBlogs.map((post) => (
                  <article
                    key={post.id}
                    className="bg-[#FAF7F2] rounded-2xl border border-[#E7E0D5] p-6 flex flex-col justify-between hover:shadow-lg transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                        <time dateTime={post.date}>
                          {new Date(post.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </time>
                      </div>

                      <h3 className="font-serif-luxury text-lg font-bold text-[#1C1917] hover:text-[#722F37] transition-colors leading-snug">
                        <Link href={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h3>

                      <p className="text-xs text-zinc-600 line-clamp-3 leading-relaxed font-light">
                        {post.content.replace(/<[^>]+>/g, '').slice(0, 140)}...
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#E7E0D5] mt-4">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#722F37] hover:underline"
                      >
                        <span>Read Full Guide</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 10. Contact Us & Showrooms Direct Callout */}
        <section className="py-14 bg-linear-to-r from-[#1C1215] via-[#2A171D] to-[#1C1215] text-white border-t border-b border-[#C5A059]/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-3 max-w-2xl">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A059] font-bold">
                  ★ All-India Boutique Supply • Central Distribution Showroom
                </span>
                <h2 className="font-serif-luxury text-2xl sm:text-3xl md:text-4xl font-bold">
                  Visit Our Barabazar Showroom or Contact Our Wholesale Desk
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
                  Walk-in wholesale sample viewing for boutique owners at Kalakar Street, Barabazar, Kolkata. Direct loom parcels dispatched nationwide from Surat.
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#C5A059] text-[#1C1215] text-xs font-bold uppercase tracking-wider hover:bg-[#d6b36e] shadow-lg transition-all hover:scale-105"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Contact Us &amp; View Showroom</span>
                </Link>

                <Link
                  href="/wholesale"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/20 border border-white/20 transition-all"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 11. Wholesale inquiry and WhatsApp CTA */}
        <WholesaleRoadmap />
      </main>

      {/* 11. Footer with verified business information */}
      <Footer />
      <MobileQuickBar />
    </div>
  );
}
