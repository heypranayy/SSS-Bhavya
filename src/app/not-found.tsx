import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#E7E0D5] p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-[#722F37]/10 text-[#722F37] rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>

          <span className="font-mono text-xs uppercase font-bold text-[#722F37] tracking-widest block">
            404 Error
          </span>

          <h1 className="font-serif-luxury text-2xl font-bold text-[#1C1917]">
            Page or Catalog Not Found
          </h1>

          <p className="text-xs text-[#78716C] leading-relaxed">
            The page or catalog link you requested cannot be located. It may have expired, been revoked, or the URL address may be misspelled.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#722F37] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5C1D24]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return Home</span>
            </Link>

            <Link
              href="/collections"
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-[#E7E0D5] text-[#1C1917] text-xs font-bold uppercase tracking-wider hover:bg-[#FAF7F2]"
            >
              Browse Catalogs
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
