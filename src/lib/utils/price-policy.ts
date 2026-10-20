import { PriceDisplayMode, Product, CatalogPresentationSettings } from '@/types';

/**
 * Deterministic precedence hierarchy for price display mode:
 * 1. Catalogue-level override (if set in presentation_settings: priceDisplayMode, or showPrices === false -> 'request')
 * 2. Product-level override (product.price_display_mode)
 * 3. Global setting default ('show')
 */
export function resolvePriceDisplayMode(
  product?: { price_display_mode?: PriceDisplayMode },
  catalogSettings?: { priceDisplayMode?: PriceDisplayMode; showPrices?: boolean },
  globalMode: PriceDisplayMode = 'show'
): PriceDisplayMode {
  // 1. Catalogue level override
  if (catalogSettings?.priceDisplayMode) {
    return catalogSettings.priceDisplayMode;
  }
  if (catalogSettings && catalogSettings.showPrices === false) {
    return 'request';
  }

  // 2. Product level override
  if (product?.price_display_mode) {
    return product.price_display_mode;
  }

  // 3. Global setting default
  return globalMode;
}

/**
 * Server-side sanitizer:
 * When price is hidden (mode === 'request' or 'contact'), DO NOT expose underlying price
 * through public responses, HTML, page metadata or client-side state.
 */
export function sanitizeProductPrice<T extends Partial<Product>>(
  product: T,
  resolvedMode: PriceDisplayMode
): T {
  if (resolvedMode === 'show') {
    return {
      ...product,
      price_display_mode: 'show',
    };
  }

  // Zero out the numerical wholesale price on the server
  return {
    ...product,
    base_wholesale_price: 0,
    price_display_mode: resolvedMode,
  };
}
