import { NextRequest, NextResponse } from 'next/server';
import { deleteProducts } from '@/lib/repository/products';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ids: string[] = [];

    if (Array.isArray(body.ids)) {
      ids.push(...body.ids);
    }
    if (body.id && typeof body.id === 'string') {
      ids.push(body.id);
    }

    const uniqueIds = Array.from(new Set(ids.map((s) => String(s || '').trim()).filter(Boolean)));
    if (uniqueIds.length === 0) {
      return NextResponse.json({ error: 'At least one Product ID is required' }, { status: 400 });
    }

    const result = await deleteProducts(uniqueIds);

    try {
      revalidatePath('/admin/products');
      revalidatePath('/admin');
      revalidatePath('/wholesale');
      revalidatePath('/products');
      revalidatePath('/collections');
      revalidatePath('/');
      revalidatePath('/', 'layout');
    } catch {}

    return NextResponse.json({ success: true, count: result.deletedCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete product' }, { status: 500 });
  }
}

