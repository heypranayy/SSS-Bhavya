import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { getAllBlogs } from '@/lib/repository/blogs';
import { BookOpen, Calendar, ArrowRight, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Wholesale Ethnic Fashion Insights & Blog | Bhavya Fashions',
  description: 'Articles, trend analysis, and retail merchandising tips from Bhavya Fashions wholesale team in Barabazar Kolkata & Surat.',
};

export default async function BlogIndexPage() {
  const blogs = await getAllBlogs();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />

      <main className="flex-1 py-12 lg:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#722F37]/10 text-[#722F37] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Ethnic Wear Insights</span>
            </div>
            <h1 className="font-serif-luxury text-4xl sm:text-5xl font-bold text-[#1C1917]">
              Fashion &amp; Retail Insights
            </h1>
            <p className="text-sm text-[#57534E] leading-relaxed">
              Curated trend breakdowns, seasonal merchandising guides, and fabric know-how for apparel retailers and boutique owners across India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogs.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl border border-[#E7E0D5] overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] bg-[#FAF7F2] overflow-hidden">
                    <img
                      src={post.image_url || '/images/hero-trio-festive.jpg'}
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {post.category && (
                      <span className="absolute top-2 left-2 bg-[#1C1917]/80 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                        {post.category}
                      </span>
                    )}
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-[#78716C]">
                      <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                      <time dateTime={post.date}>
                        {new Date(post.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </time>
                    </div>

                    <h2 className="font-serif-luxury text-xl font-bold text-[#1C1917] hover:text-[#722F37] transition-colors leading-snug line-clamp-2">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h2>

                    <p className="text-xs text-[#57534E] line-clamp-3 leading-relaxed">
                      {post.excerpt || post.content.replace(/<[^>]+>/g, '').slice(0, 150)}...
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-[#F3ECE2] mt-4 flex items-center justify-between text-xs font-bold text-[#722F37] uppercase tracking-wider">
                  <Link href={`/blog/${post.slug}`} className="flex items-center gap-1.5 hover:underline">
                    <span>Read Full Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
