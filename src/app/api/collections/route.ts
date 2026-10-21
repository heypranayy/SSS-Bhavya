import { NextRequest, NextResponse } from 'next/server';
import { getAllCollections, saveCollection, deleteCollection } from '@/lib/repository/collections';

export async function GET() {
  const collections = await getAllCollections();
  return NextResponse.json({ collections });
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    if (!json.name || !json.name.trim()) {
      return NextResponse.json({ error: 'Collection name is required' }, { status: 400 });
    }

    const saved = await saveCollection({
      id: json.id,
      name: json.name.trim(),
      slug: json.slug?.trim() || undefined,
      description: json.description?.trim() || '',
      image_url: json.image_url || '/images/cat-3piece.jpg',
      is_featured: Boolean(json.is_featured ?? true),
      product_count: json.product_count || 0,
    });

    return NextResponse.json({
      success: true,
      collection: saved,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save collection' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
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
