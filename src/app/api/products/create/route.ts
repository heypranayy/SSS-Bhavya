import { NextRequest, NextResponse } from 'next/server';
import { saveProduct } from '@/lib/repository/products';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    if (!json.title || !json.title.trim()) {
      return NextResponse.json({ error: 'Product title is required' }, { status: 400 });
    }

    const saved = await saveProduct({
      id: json.id,
      title: json.title.trim(),
      code: json.code?.trim() || `BF-K-${Math.floor(100 + Math.random() * 900)}`,
      fabric: json.fabric?.trim() || 'Pure Cotton 60-60',
      color: json.color?.trim() || 'Multicolor',
      category_id: json.category_id,
      style_type: json.style_type?.trim() || 'Straight Kurti',
      base_wholesale_price: json.base_wholesale_price !== undefined && json.base_wholesale_price !== null && json.base_wholesale_price !== '' && !isNaN(Number(json.base_wholesale_price)) ? Number(json.base_wholesale_price) : 0,
      moq: json.moq !== undefined && json.moq !== null && json.moq !== '' && !isNaN(Number(json.moq)) ? Number(json.moq) : 0,
      price_on_enquiry: json.price_on_enquiry ?? true,
      price_on_request: json.price_on_enquiry ?? true,
      price_display_mode: (json.price_on_enquiry ?? true) ? 'request' : (json.price_display_mode || 'request'),
      stock_status: json.stock_status || 'in_stock',
      is_featured: Boolean(json.is_featured),
      description: json.description?.trim() || '',
      images: json.images?.length
        ? json.images
        : [
            {
              id: `img-${Date.now()}`,
              image_url: json.image_url || '/images/cat-3piece.jpg',
              display_order: 0,
              is_primary: true,
            },
          ],
      is_active: true,
    });

    try {
      revalidatePath('/admin/products');
      revalidatePath('/wholesale');
    } catch {}

    return NextResponse.json({
      success: true,
      product: saved,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save product' }, { status: 500 });
  }
}
