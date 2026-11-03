import { NextRequest, NextResponse } from 'next/server';
import { getBucket } from '@/lib/db';
import { mediaUrl } from '@/lib/media';

const MAX_BYTES = 10 * 1024 * 1024;

function extFromMime(mimeType: string): string {
  return mimeType.includes('webp') ? 'webp' : mimeType.includes('png') ? 'png' : mimeType.includes('gif') ? 'gif' : 'jpg';
}

function cleanBase(name: string): string {
  return (name || 'upload').toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '').slice(0, 30) || 'upload';
}

async function store(bytes: Uint8Array, mimeType: string, filename: string) {
  if (!mimeType.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image uploads are allowed' }, { status: 400 });
  }
  if (bytes.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: 'Image is larger than 10 MB' }, { status: 413 });
  }

  const uniqueFilename = `${cleanBase(filename)}-${Date.now()}.${extFromMime(mimeType)}`;
  const key = `uploads/${uniqueFilename}`;
  await getBucket().put(key, bytes, {
    httpMetadata: { contentType: mimeType, cacheControl: 'public, max-age=31536000, immutable' },
  });

  return NextResponse.json({
    success: true,
    url: mediaUrl(key),
    filename: uniqueFilename,
    sizeBytes: bytes.byteLength,
    sizeKb: Math.round((bytes.byteLength / 1024) * 10) / 10,
    mimeType,
  });
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // 1. JSON with base64 dataUrl
    if (contentType.includes('application/json')) {
      const { dataUrl, filename } = await req.json();
      if (!dataUrl) {
        return NextResponse.json({ error: 'No data URL provided' }, { status: 400 });
      }

      const matches = String(dataUrl).match(/^data:([A-Za-z-+\/.]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return NextResponse.json({ error: 'Invalid data URL format' }, { status: 400 });
      }

      return store(Uint8Array.from(atob(matches[2]), (c) => c.charCodeAt(0)), matches[1], filename);
    }

    // 2. FormData with file
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'No file found in request' }, { status: 400 });
      }

      return store(new Uint8Array(await file.arrayBuffer()), file.type || 'image/webp', file.name);
    }

    return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload image' }, { status: 500 });
  }
}
