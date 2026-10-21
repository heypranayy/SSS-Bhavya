import { NextRequest, NextResponse } from 'next/server';
import { deleteCollection } from '@/lib/repository/collections';

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const id = json.id || json.collection_id;
    if (!id) {
      return NextResponse.json({ error: 'Collection ID is required' }, { status: 400 });
    }

    const success = await deleteCollection(id);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete collection' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  return POST(req);
}
