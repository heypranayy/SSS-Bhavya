import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/repository/products';
import { matchesDynamicFilters, resolveCatalogProducts } from '@/lib/engine/filter-engine';
import { FilterRuleGroup, CatalogOverride } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode = 'dynamic', rule_groups = [], overrides = [] } = body as {
      mode: 'dynamic' | 'curated' | 'hybrid';
      rule_groups: FilterRuleGroup[];
      overrides: CatalogOverride[];
    };

    const allProducts = await getAllProducts();

    const resolved = resolveCatalogProducts(allProducts, {
      mode,
      ruleGroups: rule_groups,
      overrides,
    });

    return NextResponse.json({
      matchingCount: resolved.length,
      totalActiveProducts: allProducts.filter(p => p.is_active).length,
      preview: resolved.slice(0, 8).map(p => ({
        id: p.id,
        code: p.code,
        title: p.title,
        price: p.base_wholesale_price,
        fabric: p.fabric,
        moq: p.moq,
        imageUrl: p.images[0]?.image_url,
        isPinned: p.is_pinned,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to calculate filter count' },
      { status: 500 }
    );
  }
}
