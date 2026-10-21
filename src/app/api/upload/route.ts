import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getFirebaseStorageInstance, isFirebaseConfigured } from '@/lib/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // 1. If JSON with base64 dataUrl
    if (contentType.includes('application/json')) {
      const { dataUrl, filename } = await req.json();
      if (!dataUrl) {
        return NextResponse.json({ error: 'No data URL provided' }, { status: 400 });
      }

      const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return NextResponse.json({ error: 'Invalid data URL format' }, { status: 400 });
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');
      const ext = mimeType.includes('webp') ? 'webp' : mimeType.includes('png') ? 'png' : 'jpg';
      const cleanName = (filename || 'upload').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
      const uniqueFilename = `${cleanName}-${Date.now()}.${ext}`;
      const filePath = path.join(uploadsDir, uniqueFilename);

      // Local disk cache
      fs.writeFileSync(filePath, buffer);
      let url = `/uploads/${uniqueFilename}`;

      // Firebase Storage upload
      if (isFirebaseConfigured()) {
        try {
          const storage = getFirebaseStorageInstance();
          if (storage) {
            const storageRef = ref(storage, `products/${uniqueFilename}`);
            await uploadBytes(storageRef, buffer, { contentType: mimeType });
            url = await getDownloadURL(storageRef);
          }
        } catch (storageErr) {
          console.warn('Firebase storage upload fallback to local:', storageErr);
        }
      }

      const sizeKb = Math.round((buffer.length / 1024) * 10) / 10;

      return NextResponse.json({
        success: true,
        url,
        filename: uniqueFilename,
        sizeBytes: buffer.length,
        sizeKb,
        mimeType,
      });
    }

    // 2. If FormData with file
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'No file found in request' }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name) || '.webp';
      const baseName = path.basename(file.name, ext).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
      const uniqueFilename = `${baseName}-${Date.now()}${ext}`;
      const filePath = path.join(uploadsDir, uniqueFilename);

      fs.writeFileSync(filePath, buffer);
      let url = `/uploads/${uniqueFilename}`;

      // Firebase Storage upload
      if (isFirebaseConfigured()) {
        try {
          const storage = getFirebaseStorageInstance();
          if (storage) {
            const storageRef = ref(storage, `products/${uniqueFilename}`);
            await uploadBytes(storageRef, buffer, { contentType: file.type || 'image/webp' });
            url = await getDownloadURL(storageRef);
          }
        } catch (storageErr) {
          console.warn('Firebase storage upload fallback to local:', storageErr);
        }
      }

      const sizeKb = Math.round((buffer.length / 1024) * 10) / 10;

      return NextResponse.json({
        success: true,
        url,
        filename: uniqueFilename,
        sizeBytes: buffer.length,
        sizeKb,
      });
    }

    return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload image' }, { status: 500 });
  }
}
