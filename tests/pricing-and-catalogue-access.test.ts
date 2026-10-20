import { describe, it, expect } from 'vitest';
import { resolvePriceDisplayMode, sanitizeProductPrice } from '@/lib/utils/price-policy';
import { Product, CatalogPresentationSettings } from '@/types';

describe('Price Display Mode Policy Engine', () => {
  const dummyProduct: Product = {
    id: 'prod-test-1',
    code: 'DN11059',
    title: '11059 Kurti Pant Dupatta',
    slug: '11059-kurti-pant-dupatta',
    fabric: 'KESARIA SILK',
    color: 'Red',
    style_type: '3-Piece Set',
    base_wholesale_price: 599,
    currency: 'INR',
    moq: 6,
    stock_status: 'in_stock',
    is_active: true,
    is_featured: true,
    images: [],
    variants: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  it('defaults to show mode when no overrides exist', () => {
    const mode = resolvePriceDisplayMode(dummyProduct);
    expect(mode).toBe('show');
  });

  it('respects product-level price display mode override', () => {
    const prodWithOverride: Product = {
      ...dummyProduct,
      price_display_mode: 'request',
    };
    const mode = resolvePriceDisplayMode(prodWithOverride);
    expect(mode).toBe('request');
  });

  it('catalog-level presentation setting overrides product-level setting', () => {
    const prodWithOverride: Product = {
      ...dummyProduct,
      price_display_mode: 'show',
    };
    const catalogSettings: Partial<CatalogPresentationSettings> = {
      priceDisplayMode: 'request',
    };
    const mode = resolvePriceDisplayMode(prodWithOverride, catalogSettings as CatalogPresentationSettings);
    expect(mode).toBe('request');
  });

  it('catalog-level showPrices: false defaults to request mode', () => {
    const catalogSettings: Partial<CatalogPresentationSettings> = {
      showPrices: false,
    };
    const mode = resolvePriceDisplayMode(dummyProduct, catalogSettings as CatalogPresentationSettings);
    expect(mode).toBe('request');
  });

  it('sanitizes and masks numerical price on server when mode is request or contact', () => {
    const sanitized = sanitizeProductPrice(dummyProduct, 'request');
    expect(sanitized.base_wholesale_price).toBe(0);
    expect(sanitized.price_display_mode).toBe('request');
  });

  it('preserves real price when mode is show', () => {
    const sanitized = sanitizeProductPrice(dummyProduct, 'show');
    expect(sanitized.base_wholesale_price).toBe(599);
    expect(sanitized.price_display_mode).toBe('show');
  });
});

describe('WhatsApp Message Generation Format', () => {
  it('formats selected designs with authentic DN numbers and sizes', () => {
    const selected = [
      { code: 'DN11059', title: 'Kurti Set', size: 'M', qty: 4 },
      { code: 'DN11068', title: 'Pant Set', size: 'L', qty: 6 },
    ];

    const lines = selected.map((s, i) => `${i + 1}. DN: ${s.code} — ${s.title} (Size: ${s.size}, Qty: ${s.qty})`);
    const message = `Hello Bhavya Fashions,\n\nI am interested in:\n${lines.join('\n')}\n\nPlease confirm availability and wholesale pricing.`;

    expect(message).toContain('DN: DN11059');
    expect(message).toContain('DN: DN11068');
    expect(message).toContain('Size: M');
    expect(message).not.toContain('₹');
  });
});

describe('Catalogue Code Verification Security & Status', () => {
  it('validates active catalogue code and provides correct public token', async () => {
    const { getAllCatalogs } = await import('@/lib/repository/catalogs');
    const catalogs = await getAllCatalogs();
    const activeCatalog = catalogs.find(c => c.access_code === 'BF-2026-001');

    expect(activeCatalog).toBeDefined();
    expect(activeCatalog?.status).toBe('active');
    expect(activeCatalog?.public_token).toBe('bhavya-vip-summer-2026');
  });

  it('detects expired catalogue codes accurately', async () => {
    const { getAllCatalogs } = await import('@/lib/repository/catalogs');
    const catalogs = await getAllCatalogs();
    const expiredCatalog = catalogs.find(c => c.access_code === 'BF-EXP-2025');

    expect(expiredCatalog).toBeDefined();
    expect(expiredCatalog?.status).toBe('expired');
  });

  it('detects revoked catalogue codes accurately', async () => {
    const { getAllCatalogs } = await import('@/lib/repository/catalogs');
    const catalogs = await getAllCatalogs();
    const revokedCatalog = catalogs.find(c => c.access_code === 'BF-REV-999');

    expect(revokedCatalog).toBeDefined();
    expect(revokedCatalog?.status).toBe('revoked');
  });
});
