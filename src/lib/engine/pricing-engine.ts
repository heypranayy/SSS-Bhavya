import { Customer, Product } from '@/types';

export interface CalculatedPrice {
  originalPrice: number;
  quotedPrice: number;
  discountPct: number;
  pricingTier: string;
}

/**
 * Calculates deterministic wholesale price for a product given a customer.
 */
export function calculateProductPrice(product: Product, customer?: Customer | null): CalculatedPrice {
  const original = product.base_wholesale_price;

  if (!customer) {
    return {
      originalPrice: original,
      quotedPrice: original,
      discountPct: 0,
      pricingTier: 'standard',
    };
  }

  const discount = Math.max(0, Math.min(100, customer.discount_pct || 0));
  const quoted = discount > 0
    ? Math.round((original * (1 - discount / 100)) * 100) / 100
    : original;

  return {
    originalPrice: original,
    quotedPrice: quoted,
    discountPct: discount,
    pricingTier: customer.custom_price_tier || 'standard',
  };
}

/**
 * Validates inquiry items against products and recalculates honest subtotals.
 * Never trust customer submitted subtotals or unit prices!
 */
export function validateInquiryItems(
  items: Array<{
    product_id: string;
    size_breakdown: Record<string, number>;
    notes?: string;
  }>,
  catalogProducts: Product[],
  customer?: Customer | null
) {
  const productMap = new Map(catalogProducts.map(p => [p.id, p]));
  const validatedItems = [];
  let grandTotalQuantity = 0;
  let grandIndicativeTotal = 0;

  for (const item of items) {
    const product = productMap.get(item.product_id);
    if (!product) {
      throw new Error(`Product ID ${item.product_id} is not part of this catalog.`);
    }

    // Calculate total quantity for this design
    let itemQty = 0;
    const cleanBreakdown: Record<string, number> = {};

    for (const [size, qty] of Object.entries(item.size_breakdown || {})) {
      const parsedQty = Math.max(0, Math.floor(Number(qty) || 0));
      if (parsedQty > 0) {
        cleanBreakdown[size] = parsedQty;
        itemQty += parsedQty;
      }
    }

    if (itemQty < product.moq) {
      throw new Error(
        `Product ${product.code} (${product.title}) requires minimum order quantity of ${product.moq} pieces. Current selection is ${itemQty}.`
      );
    }

    const { quotedPrice } = calculateProductPrice(product, customer);
    const subtotal = Math.round(quotedPrice * itemQty * 100) / 100;

    grandTotalQuantity += itemQty;
    grandIndicativeTotal += subtotal;

    validatedItems.push({
      product_id: product.id,
      product_code: product.code,
      product_title: product.title,
      product_image_url: product.images[0]?.image_url || '',
      quoted_price: quotedPrice,
      size_breakdown: cleanBreakdown,
      total_quantity: itemQty,
      indicative_subtotal: subtotal,
      notes: item.notes?.trim() || '',
    });
  }

  if (validatedItems.length === 0) {
    throw new Error('Please select at least one design with valid quantities.');
  }

  return {
    items: validatedItems,
    totalQuantity: grandTotalQuantity,
    indicativeTotal: Math.round(grandIndicativeTotal * 100) / 100,
  };
}
