import { NextRequest, NextResponse } from 'next/server';
import { deleteProduct } from '@/lib/repository/products';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const success = await deleteProduct(id);
    try {
      revalidatePath('/admin/products');
      revalidatePath('/wholesale');
      revalidatePath('/products');
      revalidatePath('/collections');
      revalidatePath('/');
    } catch {}

    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete product' }, { status: 500 });
  }
}
