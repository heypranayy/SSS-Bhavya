import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { saveCatalog } from '@/lib/repository/catalogs';
import { Catalog } from '@/types';

const CatalogCreateSchema = z.object({
  title: z.string().min(2, 'Catalog title is required'),
  subtitle: z.string().optional(),
  mode: z.enum(['dynamic', 'curated', 'hybrid']),
  membership_type: z.enum(['dynamic', 'fixed']).default('dynamic'),
  customer_id: z.string().optional(),
  customer_greeting: z.string().optional(),
  custom_message: z.string().optional(),
  expires_at: z.string().optional().nullable(),
  access_code: z.string().optional().nullable(),
  presentation_settings: z.record(z.string(), z.any()),
  rule_groups: z.array(z.any()).optional(),
  overrides: z.array(z.any()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = CatalogCreateSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid catalog configuration' },
        { status: 400 }
      );
    }

    const data = parsed.data;
    // Generate secure, clean slug token (e.g. bhavya-wholesale-8k2p)
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const slugBase = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
      .substring(0, 30);
    const token = `${slugBase || 'catalog'}-${randomSuffix}`;

    const saved = await saveCatalog({
      ...data,
      public_token: token,
      status: 'active',
      presentation_settings: data.presentation_settings as any,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const shareableUrl = `${appUrl}/catalog/${saved.public_token}`;

    return NextResponse.json({
      success: true,
      catalog: saved,
      public_token: saved.public_token,
      shareableUrl,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create catalog' },
      { status: 500 }
    );
  }
}
