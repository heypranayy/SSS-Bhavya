import { NextRequest, NextResponse } from 'next/server';
import { getSiteSettings, updateSiteSettings } from '@/lib/repository/settings';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    const settings = await getSiteSettings();
    return NextResponse.json(settings);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = await updateSiteSettings(body);

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/admin/settings');
      revalidatePath('/admin/products');
      revalidatePath('/wholesale');
      revalidatePath('/products');
      revalidatePath('/collections');
      revalidatePath('/');
    } catch {}

    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update settings' }, { status: 500 });
  }
}
