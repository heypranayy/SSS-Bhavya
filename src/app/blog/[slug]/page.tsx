import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { getBlogBySlug, getAllBlogs } from '@/lib/repository/blogs';
import { Calendar, ArrowLeft, Share2, PhoneCall, Tag } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    return { title: 'Article Not Found | Bhavya Fashions' };
  }

  return {
    title: `${post.title} | Bhavya Fashions Insights`,
    description: post.excerpt || post.content.replace(/<[^>]+>/g, '').slice(0, 160),
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    notFound();
  }

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919830729210';

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />

      <main className="flex-1 py-12 lg:py-16">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#722F37] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Articles</span>
          </Link>

          <header className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-[#78716C] flex-wrap">
              {post.category && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#FAF7F2] text-[#722F37] border border-[#E7E0D5]">
                  {post.category}
                </span>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </time>
              </div>
              <span>• By {post.author || 'Bhavya Fashions Editorial'}</span>
            </div>

            <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#1C1917] leading-tight">
              {post.title}
            </h1>
          </header>

          {post.image_url && (
            <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#E7E0D5]">
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div
            className="prose prose-stone max-w-none text-sm sm:text-base leading-relaxed text-[#292524] space-y-4"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="pt-8 border-t border-[#E7E0D5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-[#78716C] block">Need trade guidance for your boutique?</span>
              <strong className="text-sm font-serif-luxury text-[#1C1917]">
                Connect with Bhavya Fashions Wholesale Barabazar Hub
              </strong>
            </div>

            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello Bhavya Fashions, I read your article "${post.title}" and would like to inquire about wholesale catalog.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#20ba59] shadow-sm self-start sm:self-auto"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Discuss with Merchandiser</span>
            </a>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
