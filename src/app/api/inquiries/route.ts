import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCatalogById } from '@/lib/repository/catalogs';
import { getAllProducts } from '@/lib/repository/products';
import { resolveCatalogProducts } from '@/lib/engine/filter-engine';
import { validateInquiryItems } from '@/lib/engine/pricing-engine';
import { createInquiry } from '@/lib/repository/inquiries';

const InquirySchema = z.object({
  inquiry_type: z.enum(['website', 'catalog', 'price_request']).default('catalog'),
  source_page: z.string().optional(),
  catalog_id: z.string().optional(),
  customer_id: z.string().optional(),
  product_id: z.string().optional(),
  product_code: z.string().optional(),
  product_title: z.string().optional(),
  selected_variant: z.string().optional(),
  requested_quantity: z.number().optional(),
  buyer_name: z.string().min(2, 'Contact person name is required'),
  business_name: z.string().optional().default('Retail Inquiry'),
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
  ).optional().default([]),
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

    // Handle PRICE REQUEST Inquiries (single product or quick view price requests)
    if (data.inquiry_type === 'price_request') {
      const inquiry = await createInquiry({
        inquiry_type: 'price_request',
        source_page: data.source_page || '/products',
        catalog_id: data.catalog_id || undefined,
        product_id: data.product_id,
        product_code: data.product_code,
        product_title: data.product_title,
        selected_variant: data.selected_variant,
        requested_quantity: data.requested_quantity,
        assigned_staff: 'Pricing Desk',
        buyer_name: data.buyer_name,
        business_name: data.business_name || 'Retail Boutique',
        phone: data.phone,
        email: data.email || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        message: data.message || `Price quotation request for ${data.product_code || ''} ${data.product_title || ''}`,
        items: data.product_id ? [{
          product_id: data.product_id,
          product_code: data.product_code || 'DN-REQ',
          product_title: data.product_title || 'Design Price Request',
          quoted_price: 0,
          size_breakdown: data.selected_variant ? { [data.selected_variant]: data.requested_quantity || 6 } : {},
          total_quantity: data.requested_quantity || 6,
          indicative_subtotal: 0,
          notes: 'Price on Request Quotation',
        }] : [],
      });

      return NextResponse.json({
        success: true,
        reference_no: inquiry.reference_no,
        inquiry_id: inquiry.id,
        inquiry_type: 'price_request',
      });
    }

    // Handle WEBSITE Inquiries (from /contact or public pages)
    if (data.inquiry_type === 'website' || (!data.catalog_id && data.items.length === 0)) {
      const inquiry = await createInquiry({
        inquiry_type: 'website',
        source_page: data.source_page || '/contact',
        assigned_staff: 'B2B Helpdesk',
        buyer_name: data.buyer_name,
        business_name: data.business_name || 'Retail Inquiry',
        phone: data.phone,
        email: data.email || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        message: data.message || undefined,
        items: [],
      });

      return NextResponse.json({
        success: true,
        reference_no: inquiry.reference_no,
        inquiry_id: inquiry.id,
        inquiry_type: 'website',
      });
    }

    // Handle MANUAL or Direct Admin Inquiries (without catalog_id)
    if (!data.catalog_id) {
      const allProducts = await getAllProducts();
      const productMap = new Map(allProducts.map(p => [p.id, p]));
      
      const inquiryItems = (data.items || []).map((it, idx) => {
        const prod = productMap.get(it.product_id);
        const totalQty = Object.values(it.size_breakdown || {}).reduce((a, b) => a + Number(b), 0);
        const price = prod?.base_wholesale_price || 650;
        return {
          id: `item-${Date.now()}-${idx}`,
          product_id: it.product_id,
          product_code: prod?.code || 'BF-DIR',
          product_title: prod?.title || 'Wholesale Kurti Design',
          product_image_url: prod?.images?.[0]?.image_url,
          quoted_price: price,
          size_breakdown: it.size_breakdown,
          total_quantity: totalQty,
          indicative_subtotal: totalQty * price,
          notes: it.notes,
        };
      });

      const totalQty = inquiryItems.reduce((s, it) => s + it.total_quantity, 0);
      const indicativeTotal = inquiryItems.reduce((s, it) => s + it.indicative_subtotal, 0);

      const inquiry = await createInquiry({
        inquiry_type: 'catalog',
        source_page: data.source_page || '/admin/inquiries',
        assigned_staff: 'Kolkata Sales Desk',
        buyer_name: data.buyer_name,
        business_name: data.business_name || 'Retail Boutique',
        phone: data.phone,
        email: data.email || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        message: data.message || undefined,
        items: inquiryItems,
      });

      return NextResponse.json({
        success: true,
        reference_no: inquiry.reference_no,
        inquiry_id: inquiry.id,
        inquiry_type: 'catalog',
        total_quantity: totalQty,
        indicative_total: indicativeTotal,
      });
    }

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

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: 'At least one design must be selected for catalog inquiries' }, { status: 400 });
    }

    // Fetch catalog products to validate items & calculate prices
    const allProducts = await getAllProducts();
    const catalogProducts = resolveCatalogProducts(allProducts, {
      mode: catalog.mode,
      ruleGroups: catalog.rule_groups,
      overrides: catalog.overrides,
      customerDiscountPct: catalog.customer?.discount_pct,
    });

    const validated = validateInquiryItems(data.items, catalogProducts, catalog.customer);

    const inquiry = await createInquiry({
      inquiry_type: 'catalog',
      catalog_id: catalog.id,
      catalog_title: catalog.title,
      customer_id: data.customer_id || catalog.customer_id,
      source_page: data.source_page || `/catalog/${catalog.public_token}`,
      assigned_staff: 'Kolkata Sales Desk',
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
      inquiry_type: 'catalog',
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

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Inquiry ID is required' }, { status: 400 });
    }
    // Delete inquiry
    const { getAllInquiries } = await import('@/lib/repository/inquiries');
    const all = await getAllInquiries();
    const idx = all.findIndex(i => i.id === id || i.reference_no === id);
    if (idx !== -1) {
      all.splice(idx, 1);
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete inquiry' }, { status: 500 });
  }
}
