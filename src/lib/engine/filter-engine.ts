import { Product, FilterRule, FilterRuleGroup, CatalogOverride, CatalogProductView } from '@/types';

/**
 * Evaluates whether a single product satisfies a specific filter rule.
 */
export function evaluateFilterRule(product: Product, rule: FilterRule): boolean {
  const { attribute, operator, value } = rule;
  const productVal = (product as any)[attribute];

  switch (operator) {
    case 'equals':
      if (typeof productVal === 'string' && typeof value === 'string') {
        return productVal.toLowerCase().trim() === value.toLowerCase().trim();
      }
      return productVal === value;

    case 'not_equals':
      if (typeof productVal === 'string' && typeof value === 'string') {
        return productVal.toLowerCase().trim() !== value.toLowerCase().trim();
      }
      return productVal !== value;

    case 'in':
      if (Array.isArray(value)) {
        if (attribute === 'collection_id') {
          const productCollectionIds = product.collections?.map(c => c.id) || [];
          return value.some(v => productCollectionIds.includes(v));
        }
        return value.map(v => String(v).toLowerCase()).includes(String(productVal).toLowerCase());
      }
      return false;

    case 'not_in':
      if (Array.isArray(value)) {
        if (attribute === 'collection_id') {
          const productCollectionIds = product.collections?.map(c => c.id) || [];
          return !value.some(v => productCollectionIds.includes(v));
        }
        return !value.map(v => String(v).toLowerCase()).includes(String(productVal).toLowerCase());
      }
      return true;

    case 'greater_than':
      return Number(productVal) > Number(value);

    case 'greater_than_or_equal':
      return Number(productVal) >= Number(value);

    case 'less_than':
      return Number(productVal) < Number(value);

    case 'less_than_or_equal':
      return Number(productVal) <= Number(value);

    case 'between':
      if (Array.isArray(value) && value.length === 2) {
        const num = Number(productVal);
        return num >= Number(value[0]) && num <= Number(value[1]);
      }
      return false;

    case 'contains':
      if (typeof productVal === 'string' && typeof value === 'string') {
        return productVal.toLowerCase().includes(value.toLowerCase().trim());
      }
      return false;

    case 'not_contains':
      if (typeof productVal === 'string' && typeof value === 'string') {
        return !productVal.toLowerCase().includes(value.toLowerCase().trim());
      }
      return true;

    case 'is_empty':
      return productVal === undefined || productVal === null || productVal === '';

    case 'is_not_empty':
      return productVal !== undefined && productVal !== null && productVal !== '';

    default:
      return true;
  }
}

/**
 * Evaluates whether a product satisfies a group of rules (AND/OR).
 */
export function evaluateRuleGroup(product: Product, group: FilterRuleGroup): boolean {
  if (!group.rules || group.rules.length === 0) return true;

  if (group.logical_operator === 'OR') {
    return group.rules.some(rule => evaluateFilterRule(product, rule));
  }

  // Default is 'AND'
  return group.rules.every(rule => evaluateFilterRule(product, rule));
}

/**
 * Evaluates all rule groups for a catalog. All groups combine via AND.
 */
export function matchesDynamicFilters(product: Product, ruleGroups?: FilterRuleGroup[]): boolean {
  if (!ruleGroups || ruleGroups.length === 0) return true;
  return ruleGroups.every(group => evaluateRuleGroup(product, group));
}

/**
 * Resolves final catalog products honoring Mode (dynamic, curated, hybrid) and precedence rules.
 * Precedence hierarchy for Hybrid mode:
 * 1. Base pool = products matching dynamic filter rules
 * 2. Exclude products specified in overrides with action === 'exclude'
 * 3. Include products specified in overrides with action === 'include' (even if not matched by filters)
 * 4. Pinned products are surfaced at the beginning of the list
 * 5. Attach presentation notes and quoted pricing
 */
export function resolveCatalogProducts(
  allProducts: Product[],
  options: {
    mode: 'dynamic' | 'curated' | 'hybrid';
    ruleGroups?: FilterRuleGroup[];
    overrides?: CatalogOverride[];
    customerDiscountPct?: number;
    priceDisplayMode?: 'show' | 'request' | 'contact';
  }
): CatalogProductView[] {
  const { mode, ruleGroups = [], overrides = [], customerDiscountPct = 0, priceDisplayMode } = options;
  const productMap = new Map<string, Product>(allProducts.map(p => [p.id, p]));
  const overrideMap = new Map<string, CatalogOverride>(overrides.map(o => [o.product_id, o]));

  let selectedMap = new Map<string, Product>();

  if (mode === 'dynamic') {
    // Pure dynamic: only products passing all filters
    for (const prod of allProducts) {
      if (prod.is_active && matchesDynamicFilters(prod, ruleGroups)) {
        selectedMap.set(prod.id, prod);
      }
    }
  } else if (mode === 'curated') {
    // Pure curated: only products explicitly included via overrides
    const includes = overrides
      .filter(o => o.action === 'include')
      .sort((a, b) => a.display_order - b.display_order);

    for (const inc of includes) {
      const prod = productMap.get(inc.product_id);
      if (prod && prod.is_active) {
        selectedMap.set(prod.id, prod);
      }
    }
  } else if (mode === 'hybrid') {
    // Hybrid: Filters + Manual Exclusions + Manual Inclusions
    // Step 1: Base filtered items
    for (const prod of allProducts) {
      if (prod.is_active && matchesDynamicFilters(prod, ruleGroups)) {
        selectedMap.set(prod.id, prod);
      }
    }

    // Step 2: Apply manual exclusions (precedence over filters)
    for (const ov of overrides) {
      if (ov.action === 'exclude') {
        selectedMap.delete(ov.product_id);
      }
    }

    // Step 3: Apply manual inclusions (precedence over filters)
    for (const ov of overrides) {
      if (ov.action === 'include') {
        const prod = productMap.get(ov.product_id);
        if (prod && prod.is_active) {
          selectedMap.set(prod.id, prod);
        }
      }
    }
  }

  // Convert to CatalogProductView with quoted price and metadata
  const results: CatalogProductView[] = Array.from(selectedMap.values()).map(prod => {
    const override = overrideMap.get(prod.id);
    const discount = Math.max(0, Math.min(100, customerDiscountPct));
    const quotedPrice = discount > 0
      ? Math.round((prod.base_wholesale_price * (1 - discount / 100)) * 100) / 100
      : prod.base_wholesale_price;

    return {
      ...prod,
      price_display_mode: priceDisplayMode || prod.price_display_mode || 'request',
      quoted_price: quotedPrice,
      is_pinned: override?.is_pinned || false,
      presentation_note: override?.presentation_note,
      override_action: override?.action,
    };
  });

  // Step 4: Sort pinned products to the top, preserve override order if specified
  return results.sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;

    const orderA = overrideMap.get(a.id)?.display_order ?? 999;
    const orderB = overrideMap.get(b.id)?.display_order ?? 999;
    if (orderA !== orderB) return orderA - orderB;

    return a.code.localeCompare(b.code);
  });
}
