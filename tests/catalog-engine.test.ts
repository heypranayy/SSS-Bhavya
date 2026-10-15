import { describe, it, expect } from 'vitest';
import { evaluateFilterRule, matchesDynamicFilters, resolveCatalogProducts } from '@/lib/engine/filter-engine';
import { calculateProductPrice, validateInquiryItems } from '@/lib/engine/pricing-engine';
import { SEED_PRODUCTS, SEED_CUSTOMERS } from '@/lib/data/seed-data';
import { Product, FilterRuleGroup, CatalogOverride } from '@/types';

describe('Universal Dynamic Catalog Engine Tests', () => {
  const sampleProducts: Product[] = [...SEED_PRODUCTS];

  describe('Filter Rule Evaluation', () => {
    it('correctly filters products by price range (less_than_or_equal)', () => {
      const cheapRule = {
        id: 'r1',
        attribute: 'base_wholesale_price' as const,
        operator: 'less_than_or_equal' as const,
        value: 500,
      };

      const matching = sampleProducts.filter(p => evaluateFilterRule(p, cheapRule));
      expect(matching.length).toBeGreaterThan(0);
      matching.forEach(p => {
        expect(p.base_wholesale_price).toBeLessThanOrEqual(500);
      });
    });

    it('correctly evaluates between numeric operator', () => {
      const betweenRule = {
        id: 'r2',
        attribute: 'base_wholesale_price' as const,
        operator: 'between' as const,
        value: [500, 1000],
      };

      const matching = sampleProducts.filter(p => evaluateFilterRule(p, betweenRule));
      matching.forEach(p => {
        expect(p.base_wholesale_price).toBeGreaterThanOrEqual(500);
        expect(p.base_wholesale_price).toBeLessThanOrEqual(1000);
      });
    });

    it('correctly evaluates AND / OR logical groups', () => {
      const groupOr: FilterRuleGroup = {
        id: 'g1',
        logical_operator: 'OR',
        rules: [
          { id: 'r3', attribute: 'fabric', operator: 'contains', value: 'Cotton' },
          { id: 'r4', attribute: 'fabric', operator: 'contains', value: 'Muslin' },
        ],
      };

      const matching = sampleProducts.filter(p => matchesDynamicFilters(p, [groupOr]));
      matching.forEach(p => {
        const hasCottonOrMuslin = p.fabric.toLowerCase().includes('cotton') || p.fabric.toLowerCase().includes('muslin');
        expect(hasCottonOrMuslin).toBe(true);
      });
    });
  });

  describe('Hybrid Catalog Precedence Rules', () => {
    it('applies manual exclusions over dynamic filter results', () => {
      // Base dynamic rule: price <= 1500 (matches all)
      const ruleGroups: FilterRuleGroup[] = [
        {
          id: 'rg1',
          logical_operator: 'AND',
          rules: [{ id: 'r1', attribute: 'base_wholesale_price', operator: 'less_than_or_equal', value: 1500 }],
        },
      ];

      // Explicitly exclude first product
      const targetExclude = sampleProducts[0].id;
      const overrides: CatalogOverride[] = [
        { id: 'o1', product_id: targetExclude, action: 'exclude', display_order: 0 },
      ];

      const resolved = resolveCatalogProducts(sampleProducts, {
        mode: 'hybrid',
        ruleGroups,
        overrides,
      });

      expect(resolved.some(p => p.id === targetExclude)).toBe(false);
    });

    it('applies manual inclusions even if product does not match dynamic filters', () => {
      // Dynamic filter for cheap products only <= 400
      const ruleGroups: FilterRuleGroup[] = [
        {
          id: 'rg1',
          logical_operator: 'AND',
          rules: [{ id: 'r1', attribute: 'base_wholesale_price', operator: 'less_than_or_equal', value: 400 }],
        },
      ];

      // Expensive product (1199.00)
      const expensiveProduct = sampleProducts.find(p => p.base_wholesale_price > 1000)!;
      const overrides: CatalogOverride[] = [
        { id: 'o2', product_id: expensiveProduct.id, action: 'include', display_order: 0 },
      ];

      const resolved = resolveCatalogProducts(sampleProducts, {
        mode: 'hybrid',
        ruleGroups,
        overrides,
      });

      expect(resolved.some(p => p.id === expensiveProduct.id)).toBe(true);
    });

    it('correctly hoists pinned products to the top', () => {
      const pinnedId = sampleProducts[sampleProducts.length - 1].id;
      const overrides: CatalogOverride[] = [
        { id: 'o3', product_id: pinnedId, action: 'include', display_order: 0, is_pinned: true },
      ];

      const resolved = resolveCatalogProducts(sampleProducts, {
        mode: 'hybrid',
        ruleGroups: [],
        overrides,
      });

      expect(resolved[0].id).toBe(pinnedId);
      expect(resolved[0].is_pinned).toBe(true);
    });
  });

  describe('Customer Wholesale Pricing & Snapshots', () => {
    it('applies customer tier discount cleanly', () => {
      const product = sampleProducts[0]; // base 899
      const customer = SEED_CUSTOMERS[0]; // 5% discount
      const price = calculateProductPrice(product, customer);

      expect(price.discountPct).toBe(5);
      expect(price.quotedPrice).toBe(854.05);
    });

    it('defaults to base wholesale price when customer has no discount', () => {
      const product = sampleProducts[0];
      const customer = SEED_CUSTOMERS[1]; // 0% discount
      const price = calculateProductPrice(product, customer);

      expect(price.quotedPrice).toBe(product.base_wholesale_price);
    });
  });

  describe('Inquiry Validation & Server Protection', () => {
    it('enforces MOQ requirements on submitted design quantities', () => {
      const product = sampleProducts[0]; // MOQ is 6
      const invalidSubmission = [
        {
          product_id: product.id,
          size_breakdown: { M: 2, L: 2 }, // Total 4 < MOQ 6
        },
      ];

      expect(() => {
        validateInquiryItems(invalidSubmission, sampleProducts);
      }).toThrow(/requires minimum order quantity/i);
    });

    it('rejects products that are not part of the active catalog', () => {
      const invalidSubmission = [
        {
          product_id: 'non-existent-product-id',
          size_breakdown: { M: 10 },
        },
      ];

      expect(() => {
        validateInquiryItems(invalidSubmission, sampleProducts);
      }).toThrow(/not part of this catalog/i);
    });

    it('accurately calculates grand quantity and indicative total', () => {
      const p1 = sampleProducts[0]; // 899, MOQ 6
      const validSubmission = [
        {
          product_id: p1.id,
          size_breakdown: { M: 4, L: 4 }, // 8 pcs
        },
      ];

      const result = validateInquiryItems(validSubmission, sampleProducts);
      expect(result.totalQuantity).toBe(8);
      expect(result.indicativeTotal).toBe(7192);
    });
  });
});
