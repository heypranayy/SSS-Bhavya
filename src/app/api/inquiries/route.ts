import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCatalogById } from '@/lib/repository/catalogs';
import { getAllProducts } from '@/lib/repository/products';
import { resolveCatalogProducts } from '@/lib/engine/filter-engine';
import { validateInquiryItems } from '@/lib/engine/pricing-engine';
import { createInquiry } from '@/lib/repository/inquiries';

const InquirySchema = z.object({
  catalog_id: z.string().min(1, 'Catalog ID is required'),
  customer_id: z.string().optional(),
  buyer_name: z.string().min(2, 'Contact person name is required'),
  business_name: z.string().min(2, 'Boutique or shop name is required'),
  phone: z.string().min(8, 'Valid phone number is required'),
  email: z.string().email().optional().or(z.literal('')),
  city: z.string().optional(),
  state: z.string().optional(),
  message: z.string().optional(),
  items: z.array(
    z.object({
      product_id: z.string().min(1),
      size_breakdown: z.record(z.string(), z.number()),
      notes: z.string().optional(),
    })
  ).min(1, 'At least one design must be selected'),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = InquirySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid inquiry form data' },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // 1. Validate catalog
    const catalog = await getCatalogById(data.catalog_id);
    if (!catalog) {
      return NextResponse.json({ error: 'Catalog not found or invalid' }, { status: 404 });
    }

    if (catalog.status === 'revoked') {
      return NextResponse.json({ error: 'This catalog link has been revoked.' }, { status: 403 });
    }

    if (catalog.expires_at && new Date(catalog.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This catalog has expired.' }, { status: 403 });
    }

    // 2. Fetch catalog products to validate items & recalculate honest prices
    const allProducts = await getAllProducts();
    const catalogProducts = resolveCatalogProducts(allProducts, {
      mode: catalog.mode,
      ruleGroups: catalog.rule_groups,
      overrides: catalog.overrides,
      customerDiscountPct: catalog.customer?.discount_pct,
    });

    // 3. Server-side validation of products, sizes, MOQ and pricing calculation
    const validated = validateInquiryItems(data.items, catalogProducts, catalog.customer);

    // 4. Save to repository
    const inquiry = await createInquiry({
      catalog_id: catalog.id,
      customer_id: data.customer_id || catalog.customer_id,
      buyer_name: data.buyer_name,
      business_name: data.business_name,
      phone: data.phone,
      email: data.email || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      message: data.message || undefined,
      items: validated.items,
    });

    return NextResponse.json({
      success: true,
      reference_no: inquiry.reference_no,
      inquiry_id: inquiry.id,
      total_quantity: validated.totalQuantity,
      indicative_total: validated.indicativeTotal,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error processing wholesale inquiry' },
      { status: 400 }
    );
  }
}
