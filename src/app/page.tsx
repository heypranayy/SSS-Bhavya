import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/ui/ProductCard';
import { getAllProducts, getCollections } from '@/lib/repository/products';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  Layers,
  ArrowRight,
  PhoneCall,
  CheckCircle2,
  Package,
} from 'lucide-react';

export default async function HomePage() {
  const [products, collections] = await Promise.all([
    getAllProducts(),
    getCollections(),
  ]);

  const featuredProducts = products.filter(p => p.is_featured).slice(0, 6);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919830122334';

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />

      <main className="flex-1">
        {/* Editorial Luxury Hero Section */}
        <section className="relative overflow-hidden bg-[#FAF7F2] border-b border-[#E7E0D5] py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Text Content */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#722F37]/10 text-[#722F37] text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>B2B Wholesale Catalog Platform • 2026 Collection</span>
                </div>

                <h1 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1C1917] tracking-tight leading-[1.12]">
                  Exquisite Indian Ethnic Wear for <span className="text-[#722F37] italic font-normal">Boutiques & Retailers</span>
                </h1>

                <p className="text-base sm:text-lg text-[#57534E] leading-relaxed max-w-2xl font-light">
                  Direct manufacturer and wholesale supplier of trending single kurtis, 2-piece kurti-pant sets, and 3-piece pure muslin ensembles. Supplying premium fashion stores across India from our Barabazar (Kolkata) & Surat textile hubs.
                </p>

                {/* Wholesale Highlights */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                  <div className="bg-white border border-[#E7E0D5] p-3.5 rounded-lg shadow-2xs">
                    <span className="text-xs text-[#78716C] block uppercase font-medium">Starting Wholesale</span>
                    <span className="font-bold text-[#722F37] text-lg">₹380 – ₹1,299</span>
                  </div>
                  <div className="bg-white border border-[#E7E0D5] p-3.5 rounded-lg shadow-2xs">
                    <span className="text-xs text-[#78716C] block uppercase font-medium">Minimum Order</span>
                    <span className="font-bold text-[#1C1917] text-lg">6 Pcs / Design</span>
                  </div>
                  <div className="bg-white border border-[#E7E0D5] p-3.5 rounded-lg shadow-2xs col-span-2 sm:col-span-1">
                    <span className="text-xs text-[#78716C] block uppercase font-medium">Dispatch Hubs</span>
                    <span className="font-bold text-[#1C1917] text-base">Kolkata & Surat</span>
                  </div>
                </div>

                {/* Primary CTAs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
                  <Link
                    href="/collections"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-[#722F37] text-white text-xs uppercase tracking-wider font-bold shadow-md hover:bg-[#5C1D24] transition-all"
                  >
                    <span>Browse Wholesale Catalog</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello Bhavya Fashions, I am an ethnic wear retailer. Please share current wholesale catalogs and pricing.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-[#25D366] text-white text-xs uppercase tracking-wider font-bold shadow-sm hover:bg-[#20ba59] transition-all"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>WhatsApp Wholesale Desk</span>
                  </a>
                </div>
              </div>

              {/* Hero Image Showcase */}
              <div className="lg:col-span-5 relative">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                  <img
                    src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85"
                    alt="Bhavya Fashions Indian Ethnic Kurti Lookbook"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A059]">
                      Featured Ensemble • BF-3PC-101
                    </span>
                    <h3 className="font-serif-luxury text-xl font-bold">
                      Gulmohar Embroidered Muslin 3-Piece
                    </h3>
                    <p className="text-xs text-white/80 mt-1">
                      Pure Muslin Silk with scalloped organza dupatta • Wholesale ₹899
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Wholesale Positioning Bar */}
        <section className="bg-[#FAF7F2] py-8 border-b border-[#E7E0D5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#722F37]/10 flex items-center justify-center text-[#722F37] shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">Strictly B2B Wholesale</h4>
                  <p className="text-xs text-[#78716C]">Exclusively for retailers & resellers</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#722F37]/10 flex items-center justify-center text-[#722F37] shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">Standard Ratio Packing</h4>
                  <p className="text-xs text-[#78716C]">Sizes M to XXL proportional set</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#722F37]/10 flex items-center justify-center text-[#722F37] shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">All-India Transport</h4>
                  <p className="text-xs text-[#78716C]">Trusted transport booking & tracking</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#722F37]/10 flex items-center justify-center text-[#722F37] shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">Custom B2B Catalogs</h4>
                  <p className="text-xs text-[#78716C]">Curated links with your wholesale pricing</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Shop By Collection Section */}
        <section className="py-16 bg-white border-b border-[#E7E0D5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#722F37] font-semibold">
                  Curated Catalog Series
                </span>
                <h2 className="font-serif-luxury text-3xl font-bold text-[#1C1917] mt-1">
                  Explore by Wholesale Collection
                </h2>
              </div>
              <Link
                href="/collections"
                className="mt-4 md:mt-0 text-xs font-bold text-[#722F37] uppercase tracking-wider flex items-center gap-1 hover:underline"
              >
                <span>View All Collections</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.slice(0, 3).map((col) => (
                <Link
                  key={col.id}
                  href={`/collections/${col.slug}`}
                  className="group relative rounded-xl overflow-hidden aspect-[4/5] bg-[#EFE9E0] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-end p-6 border border-[#E7E0D5]"
                >
                  {col.image_url && (
                    <img
                      src={col.image_url}
                      alt={col.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                  <div className="relative z-10 text-white space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A059]">
                      {col.product_count || 4}+ Wholesale Designs
                    </span>
                    <h3 className="font-serif-luxury text-xl font-bold group-hover:text-[#C5A059] transition-colors">
                      {col.name}
                    </h3>
                    <p className="text-xs text-white/80 line-clamp-2 leading-relaxed">
                      {col.description}
                    </p>
                    <div className="pt-2 flex items-center text-xs font-semibold text-white group-hover:translate-x-1 transition-transform">
                      <span>View Lookbook & Pricing →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Wholesale Products */}
        <section className="py-16 bg-[#FAF7F2] border-b border-[#E7E0D5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#722F37] font-semibold">
                  Trending Fast-Movers
                </span>
                <h2 className="font-serif-luxury text-3xl font-bold text-[#1C1917] mt-1">
                  Featured Wholesale Kurtis & Sets
                </h2>
                <p className="text-xs text-[#78716C] mt-1">
                  High-demand designs recommended for boutique displays and festive counter promotions.
                </p>
              </div>

              <Link
                href="/collections"
                className="mt-4 md:mt-0 text-xs font-bold text-[#722F37] uppercase tracking-wider flex items-center gap-1 hover:underline"
              >
                <span>View Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {featuredProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        </section>

        {/* Wholesale Business Requirements & Dispatch Information */}
        <section className="py-16 bg-white border-b border-[#E7E0D5]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#FAF7F2] border border-[#E7E0D5] rounded-2xl p-8 sm:p-12 shadow-sm">
              <div className="text-center max-w-2xl mx-auto space-y-4">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#722F37]">
                  Wholesale Procurement Guide
                </span>
                <h3 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1C1917]">
                  How to Partner with Bhavya Fashions
                </h3>
                <p className="text-sm text-[#57534E] leading-relaxed">
                  We work closely with retail fashion businesses, boutique proprietors, and online resellers across India. Here is how our straightforward wholesale process operates:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                <div className="bg-white p-5 rounded-xl border border-[#E7E0D5] space-y-2.5">
                  <span className="w-8 h-8 rounded-full bg-[#722F37] text-white flex items-center justify-center font-bold text-xs">
                    1
                  </span>
                  <h4 className="font-serif-luxury text-base font-bold text-[#1C1917]">
                    Browse & Select Designs
                  </h4>
                  <p className="text-xs text-[#78716C] leading-relaxed">
                    Explore our wholesale collections online or request a custom curated catalog link tailored for your boutique's price tier.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-[#E7E0D5] space-y-2.5">
                  <span className="w-8 h-8 rounded-full bg-[#722F37] text-white flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <h4 className="font-serif-luxury text-base font-bold text-[#1C1917]">
                    Submit Ratio Requirement
                  </h4>
                  <p className="text-xs text-[#78716C] leading-relaxed">
                    Specify your quantity breakdown by sizes (M, L, XL, XXL) meeting the minimum order quantity (MOQ: 6 pcs per design).
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-[#E7E0D5] space-y-2.5">
                  <span className="w-8 h-8 rounded-full bg-[#722F37] text-white flex items-center justify-center font-bold text-xs">
                    3
                  </span>
                  <h4 className="font-serif-luxury text-base font-bold text-[#1C1917]">
                    Dispatch & Invoice
                  </h4>
                  <p className="text-xs text-[#78716C] leading-relaxed">
                    Our wholesale dispatch manager confirms live warehouse stock, prepares the GST invoice, and hands over to your preferred transport.
                  </p>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-[#E7E0D5] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-[#78716C] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>GST Billing • Nationwide Transport Booking • Barabazar & Surat Hubs</span>
                </div>

                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello Bhavya Fashions, I want to register as a wholesale retail partner.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#20ba59] transition-all"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Talk with Sales Desk</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
