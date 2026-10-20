import { NextRequest, NextResponse } from 'next/server';
import { deleteCatalog } from '@/lib/repository/catalogs';

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Catalog ID or token is required' }, { status: 400 });
    }

    const success = await deleteCatalog(id);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete catalog' }, { status: 500 });
  }
}
