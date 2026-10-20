import { NextRequest, NextResponse } from 'next/server';
import { recordCatalogShare } from '@/lib/repository/catalogs';

export async function POST(req: NextRequest) {
  try {
    const { catalogId, channel = 'direct', recipient } = await req.json();
    if (!catalogId) {
      return NextResponse.json({ error: 'catalogId is required' }, { status: 400 });
    }

    const result = await recordCatalogShare(catalogId, channel, recipient);
    return NextResponse.json({
      success: true,
      share_count: result?.share_count || 1,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to track share' }, { status: 500 });
  }
}
