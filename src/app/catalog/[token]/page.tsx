import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCatalogByToken, recordCatalogAccess } from '@/lib/repository/catalogs';
import { getAllProducts } from '@/lib/repository/products';
import { resolveCatalogProducts } from '@/lib/engine/filter-engine';
import { PublicCatalogView } from '@/components/catalog/PublicCatalogView';
import { CataloguePasscodeChallenge } from '@/components/catalog/CataloguePasscodeChallenge';
import { AlertCircle, Clock, ShieldAlert, PhoneCall } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface CatalogPageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ code?: string }>;
}

export async function generateMetadata({ params }: CatalogPageProps) {
  const { token } = await params;
  const catalog = await getCatalogByToken(token);

  if (!catalog) {
    return { title: 'Catalog Not Found | Bhavya Fashions' };
  }

  return {
    title: `${catalog.title} | Bhavya Fashions Wholesale`,
    description: catalog.subtitle || `Private wholesale lookbook for ${catalog.customer?.business_name || 'B2B buyers'}.`,
  };
}

export default async function CatalogPage({ params, searchParams }: CatalogPageProps) {
  const { token } = await params;
  const { code } = await searchParams;
  const catalog = await getCatalogByToken(token);

  if (!catalog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#E7E0D5] p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="font-serif-luxury text-2xl font-bold text-[#1C1917]">
            Catalog Not Found
          </h1>
          <p className="text-xs text-[#78716C] leading-relaxed">
            The catalog token you entered is invalid or does not exist. Please verify the link provided by Bhavya Fashions sales administration.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#722F37] text-white text-xs font-bold uppercase tracking-wider"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handle Revoked state
  if (catalog.status === 'revoked') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="font-serif-luxury text-2xl font-bold text-[#1C1917]">
            Catalog Access Revoked
          </h1>
          <p className="text-xs text-[#78716C] leading-relaxed">
            This private wholesale catalog link has been revoked by Bhavya Fashions. If you need updated designs or active wholesale pricing, please contact our sales desk.
          </p>
          <div className="pt-2">
            <a
              href={`https://wa.me/919830729210?text=${encodeURIComponent(`Hello Bhavya Fashions, my catalog link ${catalog.public_token} is showing revoked. Please share an updated active catalog.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Contact Sales on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Handle Expired state
  if (catalog.status === 'expired' || (catalog.expires_at && new Date(catalog.expires_at) < new Date())) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-amber-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8" />
          </div>
          <h1 className="font-serif-luxury text-2xl font-bold text-[#1C1917]">
            Catalog Has Expired
          </h1>
          <p className="text-xs text-[#78716C] leading-relaxed">
            This wholesale catalog link was valid until{' '}
            {catalog.expires_at
              ? new Date(catalog.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : 'recently'}
            . Wholesale quotations and stock availability are updated periodically.
          </p>
          <div className="pt-2">
            <a
              href={`https://wa.me/919830729210?text=${encodeURIComponent(`Hello Bhavya Fashions, my catalog link ${catalog.title} has expired. Please refresh the link.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Request Updated Link</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Handle secret Access Code protection
  if (catalog.access_code && catalog.access_code.trim()) {
    const isUnlocked = code && code.trim().toLowerCase() === catalog.access_code.trim().toLowerCase();
    if (!isUnlocked) {
      return (
        <CataloguePasscodeChallenge
          catalogTitle={catalog.title}
          catalogSubtitle={catalog.subtitle}
          token={catalog.public_token}
          expectedCode={catalog.access_code}
        />
      );
    }
  }

  // Record access view event
  recordCatalogAccess(catalog.id).catch(() => {});

  // Resolve matching catalog products
  const allProducts = await getAllProducts();
  const catalogProducts = resolveCatalogProducts(allProducts, {
    mode: catalog.mode,
    ruleGroups: catalog.rule_groups,
    overrides: catalog.overrides,
    customerDiscountPct: catalog.customer?.discount_pct,
    priceDisplayMode: (catalog.presentation_settings as any)?.priceDisplayMode || 'request',
  });

  return (
    <PublicCatalogView
      catalog={catalog}
      products={catalogProducts}
    />
  );
}
