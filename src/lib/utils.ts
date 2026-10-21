import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactNumber(num: number): string {
  return new Intl.NumberFormat('en-IN', { notation: 'compact' }).format(num);
}

export function getProductFallbackImage(styleOrCategory?: string, code?: string): string {
  const str = (styleOrCategory || '').toLowerCase();
  if (str.includes('2-piece') || str.includes('2p') || str.includes('two')) return '/images/cat-2piece.jpg';
  if (str.includes('co-ord') || str.includes('coord')) return '/images/cat-coord.jpg';
  if (str.includes('anarkali') || str.includes('gown')) return '/images/cat-anarkali.jpg';
  if (str.includes('cotton') || str.includes('single') || str.includes('western')) return '/images/hero-cotton-summer.jpg';
  if (str.includes('kesaria') || str.includes('silk') || str.includes('festive')) return '/images/hero-chanderi-festive.jpg';
  return '/images/cat-3piece.jpg';
}

export function getProductDisplayImage(
  product?: {
    images?: Array<{ local_url?: string; image_url?: string; is_primary?: boolean }>;
    style_type?: string;
    category?: { name?: string };
  } | null
): string {
  if (!product) return '/images/cat-3piece.jpg';
  const fallback = getProductFallbackImage(product.style_type || product.category?.name);
  const primary = product.images?.find((img) => img.is_primary) || product.images?.[0];
  if (primary?.local_url && primary.local_url.trim()) return primary.local_url;
  if (primary?.image_url && primary.image_url.trim()) {
    // Avoid dead 403 remote WordPress endpoints
    if (primary.image_url.includes('bhavyafashions.com/wp-content/uploads')) {
      return fallback;
    }
    return primary.image_url;
  }
  return fallback;
}
